import json

def fix_json():
    qa_list = []
    try:
        with open('qa.txt', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                if '→' in line:
                    parts = line.split('→', 1)
                    if len(parts) == 2:
                        qa_list.append({
                            "question": parts[0].strip(),
                            "answer": parts[1].strip()
                        })
        
        with open('qa.json', 'w', encoding='utf-8') as f:
            json.dump(qa_list, f, ensure_ascii=False, indent=2)
        print(f"Successfully created qa.json with {len(qa_list)} entries.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_json()
