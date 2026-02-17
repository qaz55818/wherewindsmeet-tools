import json

def convert_to_json(file_path):
    qa_list = []
    # Use utf-8-sig to handle BOM if present
    with open(file_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if '→' in line:
                parts = line.split('→', 1)
                if len(parts) == 2:
                    # Clean up any potential invisible characters
                    q = parts[0].strip().replace('\ufeff', '')
                    a = parts[1].strip().replace('\ufeff', '')
                    qa_list.append({
                        "question": q,
                        "answer": a
                    })
    
    with open('qa.json', 'w', encoding='utf-8') as f:
        json.dump(qa_list, f, ensure_ascii=False, indent=2)
    print(f"Done: {len(qa_list)} entries.")

if __name__ == "__main__":
    convert_to_json('qa.txt')
