# Smart Attendance Shortage Predictor

Plain HTML/CSS/JS. No install, no backend.

## Run in VS Code
1. Open the `smart-attendance-predictor` folder in VS Code (File > Open Folder).
2. Install the "Live Server" extension (Ritwick Dey).
3. Right-click `index.html` and choose "Open with Live Server".
4. Log in with the demo account (demo@student.com / demo123) or register.
5. Click "Generate attendance" to create new random data.

## Test cases (target 75%) - use the What-if predictor
- 40 attended, 60 conducted, 25 upcoming -> High, "Attend next 24 classes to reach 75%."
- 54 attended, 60 conducted, 20 upcoming -> Medium, "Attend next 6 classes to reach 75%."
- 60 attended, 60 conducted, 10 upcoming -> Low, safe to skip all 10 remaining classes.
- 30 attended, 60 conducted, 5 upcoming -> High, shortage unavoidable (max 53.8%).

## Dataset
- `data/attendance_dataset.csv`: 30 students x 6 subjects (180 rows). Columns: roll_no, student_name, subject, attended, conducted, upcoming, attendance_pct, risk.
- On the dashboard click "Load sample dataset" (needs Live Server) or upload any CSV, pick a student, then "Use this student's data".
- Your own CSV only needs: subject, attended, conducted, upcoming (roll_no and student_name are optional).
- To regenerate: `cd data` then `python generate_dataset.py`.
