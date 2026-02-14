import os
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="QuickTask Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/quicktask")
client = MongoClient(MONGODB_URI)
# Extract database name from URI, default to 'quicktask'
db_name = MONGODB_URI.rsplit("/", 1)[-1].split("?")[0] or "quicktask"
db = client[db_name]
tasks_collection = db["tasks"]
users_collection = db["users"]


@app.get("/api/analytics/health")
def health_check():
    return {"status": "ok", "service": "analytics"}


@app.get("/api/analytics/user-stats/{user_id}")
def get_user_statistics(user_id: str):
    """
    User Statistics Endpoint
    Returns aggregate stats for a user including task counts,
    completion rate, priority distribution, and overdue tasks.
    """
    try:
        uid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Verify user exists
    user = users_collection.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.utcnow()

    # Aggregate pipeline for comprehensive stats
    pipeline = [
        {"$match": {"user": uid}},
        {
            "$group": {
                "_id": None,
                "total_tasks": {"$sum": 1},
                "completed": {
                    "$sum": {"$cond": [{"$eq": ["$status", "Completed"]}, 1, 0]}
                },
                "in_progress": {
                    "$sum": {"$cond": [{"$eq": ["$status", "In Progress"]}, 1, 0]}
                },
                "todo": {
                    "$sum": {"$cond": [{"$eq": ["$status", "Todo"]}, 1, 0]}
                },
                "high_priority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "High"]}, 1, 0]}
                },
                "medium_priority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "Medium"]}, 1, 0]}
                },
                "low_priority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "Low"]}, 1, 0]}
                },
                "overdue": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    {"$ne": ["$status", "Completed"]},
                                    {"$lt": ["$dueDate", now]},
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },
            }
        },
    ]

    result = list(tasks_collection.aggregate(pipeline))

    if not result:
        return {
            "user_id": user_id,
            "user_name": user.get("name", ""),
            "total_tasks": 0,
            "completed": 0,
            "in_progress": 0,
            "todo": 0,
            "overdue": 0,
            "completion_rate": 0,
            "priority_distribution": {"High": 0, "Medium": 0, "Low": 0},
            "status_distribution": {"Todo": 0, "In Progress": 0, "Completed": 0},
        }

    stats = result[0]
    total = stats["total_tasks"]
    completion_rate = round((stats["completed"] / total) * 100, 1) if total > 0 else 0

    return {
        "user_id": user_id,
        "user_name": user.get("name", ""),
        "total_tasks": total,
        "completed": stats["completed"],
        "in_progress": stats["in_progress"],
        "todo": stats["todo"],
        "overdue": stats["overdue"],
        "completion_rate": completion_rate,
        "priority_distribution": {
            "High": stats["high_priority"],
            "Medium": stats["medium_priority"],
            "Low": stats["low_priority"],
        },
        "status_distribution": {
            "Todo": stats["todo"],
            "In Progress": stats["in_progress"],
            "Completed": stats["completed"],
        },
    }


@app.get("/api/analytics/productivity/{user_id}")
def get_productivity_analysis(
    user_id: str,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to analyze"),
):
    """
    Productivity Analysis Endpoint
    Returns task completion trends over a specified time period.
    Shows daily task creation and completion counts.
    """
    try:
        uid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = users_collection.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.utcnow()
    start_date = now - timedelta(days=days)

    # Tasks created in the period
    created_pipeline = [
        {"$match": {"user": uid, "createdAt": {"$gte": start_date, "$lte": now}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]

    # Tasks completed in the period (using updatedAt as proxy for completion)
    completed_pipeline = [
        {
            "$match": {
                "user": uid,
                "status": "Completed",
                "updatedAt": {"$gte": start_date, "$lte": now},
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$updatedAt"}
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]

    created_results = list(tasks_collection.aggregate(created_pipeline))
    completed_results = list(tasks_collection.aggregate(completed_pipeline))

    # Build a day-by-day map
    created_map = {r["_id"]: r["count"] for r in created_results}
    completed_map = {r["_id"]: r["count"] for r in completed_results}

    # Generate daily data points
    daily_data = []
    total_created = 0
    total_completed = 0

    current = start_date
    while current <= now:
        date_str = current.strftime("%Y-%m-%d")
        created_count = created_map.get(date_str, 0)
        completed_count = completed_map.get(date_str, 0)
        total_created += created_count
        total_completed += completed_count

        daily_data.append(
            {
                "date": date_str,
                "created": created_count,
                "completed": completed_count,
            }
        )
        current += timedelta(days=1)

    avg_daily_completion = round(total_completed / max(days, 1), 2)

    return {
        "user_id": user_id,
        "period_days": days,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": now.strftime("%Y-%m-%d"),
        "total_created": total_created,
        "total_completed": total_completed,
        "average_daily_completions": avg_daily_completion,
        "daily_data": daily_data,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("ANALYTICS_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
