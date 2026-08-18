import os
import subprocess
import re
import sys

STATE_FILE = ".build-state/current-phase.txt"
ORCHESTRATOR = "orchestrator.md"

def get_current_phase():
    try:
        with open(STATE_FILE, 'r') as f:
            return int(f.read().strip())
    except:
        return 1

def set_current_phase(phase):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, 'w') as f:
        f.write(str(phase))

def extract_phase_instructions(phase):
    with open(ORCHESTRATOR, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = rf"## المرحلة {phase}:.*?\n\*\*MODEL:\*\* `(.*?)`.*?\n\*\*المطلوب:\*\*\n(.*?)(?=\n## المرحلة |\Z)"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print(f"❌ لم أجد المرحلة {phase} في الملف.")
        sys.exit(1)
    model = match.group(1).strip()
    instructions = match.group(2).strip()
    return model, instructions

def run_aider(model, instructions):
    cmd = [
        "aider",
        "--model", f"litellm_proxy/{model}",
        "--openai-api-base", "http://localhost:4000",
        "--openai-api-key", "sk-1234",
        "--message", instructions
    ]
    print(f"🚀 تشغيل Aider بالنموذج: {model}")
    subprocess.run(cmd)

if __name__ == "__main__":
    phase = get_current_phase()
    max_phase = 7
    if phase > max_phase:
        print("✅ جميع المراحل مكتملة! المشروع جاهز.")
        sys.exit(0)
    print(f"📌 البدء في المرحلة {phase} من {max_phase}...")
    model, instructions = extract_phase_instructions(phase)
    run_aider(model, instructions)
    set_current_phase(phase + 1)
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", f"Phase {phase} completed"])
    subprocess.run(["git", "push", "origin", "main"])
    print(f"✅ تم إكمال المرحلة {phase}. انتقل إلى المرحلة {phase + 1}")
    print("🔄 لتشغيل المرحلة التالية، أعد تشغيل: python build.py")