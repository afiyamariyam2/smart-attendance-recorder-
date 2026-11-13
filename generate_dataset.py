"""Creates data/attendance_dataset.csv  (run: python generate_dataset.py)"""
import csv, math, random
random.seed(42)
SUBJECTS = ["Data Structures", "DBMS", "Operating Systems", "Computer Networks", "Mathematics", "Python Programming"]
NAMES = ["Aarav Kumar","Diya Sharma","Mohammed Faizan","Priya Nair","Karthik Raj","Sneha Iyer","Arjun Menon","Fathima Begum",
         "Vikram Singh","Ananya Reddy","Rahul Verma","Meera Krishnan","Imran Khan","Lakshmi Devi","Suresh Babu","Nandini Rao",
         "Yusuf Ali","Kavya Pillai","Harish Kumar","Pooja Gupta","Naveen Raj","Zainab Fatima","Dinesh Kumar","Shreya Patel",
         "Gokul Krishna","Ayesha Siddiqui","Prakash Raj","Divya Bharathi","Sanjay Kumar","Revathi Sundar"]
TARGET = 75

def risk(att, cond, up):
    total = cond + up
    need = max(0, math.ceil(TARGET * total / 100 - 1e-9) - att)
    pct = att / cond * 100
    if need > up: return "High"
    if need > 0: return "High" if need > 0.7 * up else "Medium"
    return "Medium" if pct < TARGET + 5 else "Low"

with open("attendance_dataset.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["roll_no", "student_name", "subject", "attended", "conducted", "upcoming", "attendance_pct", "risk"])
    for i, name in enumerate(NAMES, 1):
        base = random.uniform(0.66, 0.99)
        for sub in SUBJECTS:
            cond = random.randint(30, 60)
            p = min(1, max(0.4, random.gauss(base, 0.06)))
            att = min(cond, round(cond * p))
            up = random.randint(10, 30)
            w.writerow([f"21CS{i:03d}", name, sub, att, cond, up, round(att / cond * 100, 1), risk(att, cond, up)])
print("attendance_dataset.csv created")
