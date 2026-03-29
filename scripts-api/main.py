import subprocess
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CSEC Supply Chain Demo Runner")

_env_origins = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = [o.strip().rstrip("/") for o in _env_origins.split(",") if o.strip()]
if not allowed_origins:
    allowed_origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMOS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demos")


class DemoRequest(BaseModel):
    demo: str


@app.get("/run/health")
def health():
    return {"status": "ok", "service": "csec-scripts-api"}


@app.post("/run/demo")
def run_demo(req: DemoRequest):
    demo_map = {
        "postinstall": os.path.join(DEMOS_DIR, "malicious-postinstall", "malicious.js"),
    }

    script = demo_map.get(req.demo)
    if not script or not os.path.exists(script):
        return {"output": f"[!] Unknown demo: {req.demo}\nAvailable: {list(demo_map.keys())}"}

    try:
        result = subprocess.run(
            ["node", script],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=os.path.dirname(script),
        )
        output = result.stdout
        if result.stderr:
            output += "\n[stderr]\n" + result.stderr
        return {"output": output}
    except subprocess.TimeoutExpired:
        return {"output": "[!] Demo timed out after 10 seconds."}
    except FileNotFoundError:
        return {"output": "[!] Node.js not found. Make sure node is installed."}
    except Exception as e:
        return {"output": f"[!] Error running demo: {str(e)}"}
