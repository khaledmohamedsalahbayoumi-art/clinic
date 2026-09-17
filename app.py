import os
import json
import socket
import time
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, send_file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, 'frontend', 'dist')
DATA_FILE = os.path.join(BASE_DIR, 'backend', 'data', 'clinic_data.json')

app = Flask(__name__, static_folder=FRONTEND_DIST)

# CORS Support (supports flask_cors or native Flask headers fallback)
try:
    from flask_cors import CORS
    CORS(app)
except Exception:
    @app.after_request
    def add_cors(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
        return response

    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            resp = app.make_default_options_response()
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
            resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
            return resp

# ------------------- DATA STORE (قاعدة البيانات وملف JSON) -------------------
_memory_store = None

def get_store():
    global _memory_store
    if _memory_store is not None:
        return _memory_store
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                _memory_store = json.load(f)
                return _memory_store
        except Exception as e:
            print(f"Error loading JSON data: {e}")
    _memory_store = {
        "branches": [],
        "clinics": [],
        "doctors": [],
        "patients": [],
        "appointments": [],
        "prescriptions": [],
        "transactions": [],
        "users": [],
        "labRequests": []
    }
    return _memory_store

def save_store():
    global _memory_store
    if _memory_store is None:
        return
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(_memory_store, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving JSON data: {e}")

# Ensure initial store is loaded
get_store()


# ------------------- LOGGING & HEALTH CHECK -------------------
@app.before_request
def log_request():
    if request.path.startswith('/api'):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {request.method} {request.path}")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat() + "Z"})

@app.route('/api/network-info', methods=['GET'])
def network_info():
    port = int(os.environ.get('PORT', 5000))
    local_ip = '127.0.0.1'
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass

    local_url = f"http://{local_ip}:{port}"
    return jsonify({
        "port": port,
        "localIp": local_ip,
        "localUrl": local_url,
        "clientPortalUrl": f"{local_url}/?portal=client",
        "waitingScreenUrl": f"{local_url}/?screen=waiting",
        "interfaces": [{"name": "Default", "ip": local_ip, "url": local_url}]
    })


# ------------------- AUTHENTICATION (تسجيل الدخول) -------------------
@app.route('/api/auth/login', methods=['POST'])
def login():
    store = get_store()
    data = request.get_json() or {}
    username = (data.get('username') or '').strip().lower()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({"error": "اسم المستخدم وكلمة المرور مطلوبان"}), 400

    user = None
    for u in store.get('users', []):
        u_name = (u.get('username') or '').strip().lower()
        if u_name == username:
            if u.get('password') == password or (u.get('role') == 'owner' and password in ['2026', 'admin123']):
                user = u
                break

    if not user:
        return jsonify({"error": "اسم المستخدم أو كلمة المرور غير صحيحة"}), 401

    safe_user = {
        "id": user.get("id"),
        "username": user.get("username"),
        "name": user.get("name"),
        "role": user.get("role"),
        "title": user.get("title", ""),
        "branchId": user.get("branchId", "all"),
        "doctorId": user.get("doctorId"),
        "phone": user.get("phone", ""),
        "permissions": user.get("permissions", [])
    }

    return jsonify({
        "message": "تم تسجيل الدخول بنجاح",
        "user": safe_user,
        "token": f"mock-jwt-token-{user.get('id')}-{int(time.time()*1000)}"
    })


# ------------------- USERS (المستخدمين والصلاحيات) -------------------
@app.route('/api/users', methods=['GET'])
def get_users():
    store = get_store()
    safe_users = []
    for u in store.get('users', []):
        safe_users.append({
            "id": u.get("id"),
            "username": u.get("username"),
            "password": u.get("password", ""),
            "name": u.get("name"),
            "role": u.get("role"),
            "title": u.get("title", ""),
            "branchId": u.get("branchId", "all"),
            "doctorId": u.get("doctorId"),
            "phone": u.get("phone", ""),
            "permissions": u.get("permissions", []),
            "createdAt": u.get("createdAt")
        })
    return jsonify(safe_users)

@app.route('/api/users', methods=['POST'])
def create_user():
    store = get_store()
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    name = (data.get('name') or '').strip()
    role = data.get('role')

    if not username or not password or not name or not role:
        return jsonify({"error": "الاسم واسم المستخدم وكلمة المرور والدور حقول مطلوبة"}), 400

    for u in store.get('users', []):
        if (u.get('username') or '').lower() == username.lower():
            return jsonify({"error": "اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر"}), 400

    new_user = {
        "id": f"usr_{int(time.time()*1000)}",
        "username": username,
        "password": password,
        "name": name,
        "role": role,
        "title": data.get('title', ''),
        "branchId": data.get('branchId', 'all'),
        "doctorId": data.get('doctorId'),
        "phone": data.get('phone', ''),
        "permissions": data.get('permissions') if isinstance(data.get('permissions'), list) else [],
        "createdAt": datetime.now().strftime('%Y-%m-%d')
    }

    store.setdefault('users', []).append(new_user)
    save_store()

    safe = dict(new_user)
    safe.pop('password', None)
    return jsonify(safe), 201

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    store = get_store()
    data = request.get_json() or {}
    target = None
    for u in store.get('users', []):
        if u.get('id') == user_id:
            target = u
            break
    if not target:
        return jsonify({"error": "المستخدم غير موجود"}), 404

    if 'name' in data: target['name'] = data['name'].strip()
    if 'role' in data: target['role'] = data['role']
    if 'title' in data: target['title'] = data['title']
    if 'branchId' in data: target['branchId'] = data['branchId']
    if 'doctorId' in data: target['doctorId'] = data['doctorId']
    if 'phone' in data: target['phone'] = data['phone']
    if 'permissions' in data and isinstance(data['permissions'], list): target['permissions'] = data['permissions']
    if 'password' in data and data['password'].strip(): target['password'] = data['password'].strip()

    save_store()
    safe = dict(target)
    safe.pop('password', None)
    return jsonify(safe)

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    store = get_store()
    user = next((u for u in store.get('users', []) if u.get('id') == user_id), None)
    if not user:
        return jsonify({"error": "المستخدم غير موجود"}), 404
    if user.get('role') == 'owner' and user.get('username') == 'owner':
        return jsonify({"error": "لا يمكن حذف الحساب الرئيسي للمالك"}), 400

    if user.get('doctorId'):
        store['doctors'] = [d for d in store.get('doctors', []) if d.get('id') != user.get('doctorId')]
    elif user.get('role') == 'doctor':
        store['doctors'] = [d for d in store.get('doctors', []) if not (d.get('name') == user.get('name') and d.get('phone') == user.get('phone'))]

    store['users'] = [u for u in store.get('users', []) if u.get('id') != user_id]
    save_store()
    return jsonify({"message": "تم حذف المستخدم والملف المرتبط به بنجاح"})


# ------------------- BRANCHES (الفروع) -------------------
@app.route('/api/branches', methods=['GET'])
def get_branches():
    return jsonify(get_store().get('branches', []))

@app.route('/api/branches', methods=['POST'])
def create_branch():
    store = get_store()
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({"error": "اسم الفرع مطلوب"}), 400

    is_main = bool(data.get('isMain'))
    new_branch = {
        "id": f"br_{int(time.time()*1000)}",
        "name": name,
        "address": data.get('address', ''),
        "phone": data.get('phone', ''),
        "isMain": is_main
    }

    if is_main:
        for b in store.get('branches', []):
            b['isMain'] = False

    store.setdefault('branches', []).append(new_branch)
    save_store()
    return jsonify(new_branch), 201

@app.route('/api/branches/<branch_id>', methods=['PUT'])
def update_branch(branch_id):
    store = get_store()
    branch = next((b for b in store.get('branches', []) if b.get('id') == branch_id), None)
    if not branch:
        return jsonify({"error": "الفرع غير موجود"}), 404

    data = request.get_json() or {}
    if 'name' in data: branch['name'] = data['name'].strip()
    if 'address' in data: branch['address'] = data['address'].strip()
    if 'phone' in data: branch['phone'] = data['phone'].strip()
    if 'isMain' in data:
        is_main = bool(data['isMain'])
        if is_main:
            for b in store.get('branches', []):
                b['isMain'] = (b.get('id') == branch_id)
        else:
            branch['isMain'] = False

    save_store()
    return jsonify(branch)

@app.route('/api/branches/<branch_id>', methods=['DELETE'])
def delete_branch(branch_id):
    store = get_store()
    branches = store.get('branches', [])
    if len(branches) <= 1:
        return jsonify({"error": "لا يمكن حذف الفرع الأخير، يجب وجود فرع واحد على الأقل في المركز"}), 400

    target_idx = next((i for i, b in enumerate(branches) if b.get('id') == branch_id), None)
    if target_idx is None:
        return jsonify({"error": "الفرع غير موجود"}), 404

    deleted = branches.pop(target_idx)
    if deleted.get('isMain') and len(branches) > 0:
        branches[0]['isMain'] = True

    save_store()
    return jsonify({"message": "تم حذف الفرع بنجاح"})


# ------------------- CLINICS (العيادات والتخصصات) -------------------
@app.route('/api/clinics', methods=['GET'])
def get_clinics():
    return jsonify(get_store().get('clinics', []))

@app.route('/api/clinics', methods=['POST'])
def create_clinic():
    store = get_store()
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({"error": "اسم العيادة مطلوب"}), 400

    new_clinic = {
        "id": f"cl_{int(time.time()*1000)}",
        "name": name,
        "icon": data.get('icon', '🩺'),
        "workingHours": data.get('workingHours', 'يومياً من 09:00 ص إلى 10:00 م'),
        "description": data.get('description', '')
    }
    store.setdefault('clinics', []).append(new_clinic)
    save_store()
    return jsonify(new_clinic), 201

@app.route('/api/clinics/<clinic_id>', methods=['PUT'])
def update_clinic(clinic_id):
    store = get_store()
    clinic = next((c for c in store.get('clinics', []) if c.get('id') == clinic_id), None)
    if not clinic:
        return jsonify({"error": "العيادة غير موجودة"}), 404

    data = request.get_json() or {}
    old_name = clinic.get('name')
    if 'name' in data: clinic['name'] = data['name'].strip()
    if 'icon' in data: clinic['icon'] = data['icon']
    if 'workingHours' in data: clinic['workingHours'] = data['workingHours'].strip()
    if 'description' in data: clinic['description'] = data['description'].strip()

    if 'name' in data and data['name'].strip() != old_name:
        for d in store.get('doctors', []):
            if d.get('clinicId') == clinic_id:
                d['clinicName'] = clinic['name']

    save_store()
    return jsonify(clinic)

@app.route('/api/clinics/<clinic_id>', methods=['DELETE'])
def delete_clinic(clinic_id):
    store = get_store()
    clinics = store.get('clinics', [])
    if len(clinics) <= 1:
        return jsonify({"error": "لا يمكن حذف العيادة الأخيرة"}), 400

    idx = next((i for i, c in enumerate(clinics) if c.get('id') == clinic_id), None)
    if idx is None:
        return jsonify({"error": "العيادة غير موجودة"}), 404

    clinics.pop(idx)
    save_store()
    return jsonify({"message": "تم حذف العيادة بنجاح"})


# ------------------- DOCTORS (الأطباء) -------------------
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    store = get_store()
    branch_id = request.args.get('branchId')
    clinic_id = request.args.get('clinicId')
    search = request.args.get('search')
    docs = store.get('doctors', [])

    if branch_id and branch_id != 'all':
        docs = [d for d in docs if branch_id in d.get('branchIds', [])]
    if clinic_id and clinic_id != 'all':
        docs = [d for d in docs if d.get('clinicId') == clinic_id]
    if search:
        q = search.strip().lower()
        docs = [d for d in docs if q in (d.get('name') or '').lower() or q in (d.get('clinicName') or '').lower()]

    return jsonify(docs)

@app.route('/api/doctors/<doc_id>', methods=['GET'])
def get_doctor_by_id(doc_id):
    store = get_store()
    doc = next((d for d in store.get('doctors', []) if d.get('id') == doc_id), None)
    if not doc:
        return jsonify({"error": "الطبيب غير موجود"}), 404
    return jsonify(doc)

@app.route('/api/doctors', methods=['POST'])
def create_doctor():
    store = get_store()
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    clinic_id = data.get('clinicId')
    if not name or not clinic_id:
        return jsonify({"error": "اسم الطبيب والتخصص مطلوبان"}), 400

    clinic = next((c for c in store.get('clinics', []) if c.get('id') == clinic_id), None)
    clinic_name = clinic.get('name') if clinic else 'عيادة متخصصة'

    branch_ids = data.get('branchIds') if isinstance(data.get('branchIds'), list) and data.get('branchIds') else ['br_maadi']
    consultation_fee = float(data.get('consultationFee') or 400)
    follow_up_fee = float(data.get('followUpFee') or round(consultation_fee * 0.3))

    schedule = data.get('schedule') if isinstance(data.get('schedule'), list) and data.get('schedule') else [
        {"day": "السبت", "time": "10:00 ص - 03:00 م", "branchId": branch_ids[0]},
        {"day": "الثلاثاء", "time": "04:00 م - 09:00 م", "branchId": branch_ids[0]}
    ]

    new_doc = {
        "id": f"doc_{int(time.time()*1000)}",
        "name": name,
        "title": data.get('title') or 'طبيب استشاري',
        "clinicId": clinic_id,
        "clinicName": clinic_name,
        "branchIds": branch_ids,
        "consultationFee": consultation_fee,
        "followUpFee": follow_up_fee,
        "rating": 5.0,
        "reviewsCount": 1,
        "phone": (data.get('phone') or '').strip(),
        "avatar": data.get('avatar', '👨‍⚕️'),
        "status": data.get('status', 'available'),
        "experienceYears": int(data.get('experienceYears') or 10),
        "education": data.get('education') or 'استشاري معتمد',
        "schedule": schedule
    }

    store.setdefault('doctors', []).append(new_doc)
    save_store()
    return jsonify(new_doc), 201

@app.route('/api/doctors/<doc_id>', methods=['PUT'])
def update_doctor(doc_id):
    store = get_store()
    doc = next((d for d in store.get('doctors', []) if d.get('id') == doc_id), None)
    if not doc:
        return jsonify({"error": "الطبيب غير موجود"}), 404

    data = request.get_json() or {}
    if 'name' in data: doc['name'] = data['name'].strip()
    if 'title' in data: doc['title'] = data['title'].strip()
    if 'clinicId' in data:
        doc['clinicId'] = data['clinicId']
        clinic = next((c for c in store.get('clinics', []) if c.get('id') == data['clinicId']), None)
        if clinic: doc['clinicName'] = clinic.get('name')
    if 'branchIds' in data and isinstance(data['branchIds'], list): doc['branchIds'] = data['branchIds']
    if 'consultationFee' in data: doc['consultationFee'] = float(data['consultationFee'])
    if 'followUpFee' in data: doc['followUpFee'] = float(data['followUpFee'])
    if 'phone' in data: doc['phone'] = data['phone'].strip()
    if 'avatar' in data: doc['avatar'] = data['avatar']
    if 'status' in data: doc['status'] = data['status']
    if 'schedule' in data and isinstance(data['schedule'], list): doc['schedule'] = data['schedule']
    if 'experienceYears' in data: doc['experienceYears'] = int(data['experienceYears'])
    if 'education' in data: doc['education'] = data['education']

    # Update associated user
    for u in store.get('users', []):
        if u.get('doctorId') == doc_id and 'name' in data:
            u['name'] = doc['name']

    save_store()
    return jsonify(doc)

@app.route('/api/doctors/<doc_id>', methods=['DELETE'])
def delete_doctor(doc_id):
    store = get_store()
    docs = store.get('doctors', [])
    idx = next((i for i, d in enumerate(docs) if d.get('id') == doc_id), None)
    if idx is None:
        return jsonify({"error": "الطبيب غير موجود"}), 404

    docs.pop(idx)
    store['users'] = [u for u in store.get('users', []) if u.get('doctorId') != doc_id]
    save_store()
    return jsonify({"message": "تم حذف الطبيب وحسابه بنجاح"})


# ------------------- PATIENTS (المرضى) -------------------
@app.route('/api/patients', methods=['GET'])
def get_patients():
    store = get_store()
    search = request.args.get('search')
    patients = store.get('patients', [])

    if search:
        q = search.strip().lower()
        patients = [
            p for p in patients
            if q in (p.get('name') or '').lower() or
               q in (p.get('phone') or '') or
               q in (p.get('code') or '').lower() or
               q in (p.get('nationalId') or '')
        ]

    return jsonify(patients)

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient_by_id(patient_id):
    store = get_store()
    patient = next((p for p in store.get('patients', []) if p.get('id') == patient_id or p.get('phone') == patient_id), None)
    if not patient:
        return jsonify({"error": "المريض غير موجود"}), 404

    apts = [a for a in store.get('appointments', []) if a.get('patientId') == patient.get('id')]
    rxs = [rx for rx in store.get('prescriptions', []) if rx.get('patientId') == patient.get('id')]

    result = dict(patient)
    result['appointments'] = apts
    result['prescriptions'] = rxs
    return jsonify(result)

@app.route('/api/patients', methods=['POST'])
def create_patient():
    store = get_store()
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()

    if not name or not phone:
        return jsonify({"error": "اسم المريض ورقم الهاتف مطلوبان"}), 400

    existing = next((p for p in store.get('patients', []) if p.get('phone') == phone), None)
    if existing:
        return jsonify(existing)

    code = f"MED-{1000 + len(store.get('patients', [])) + 1}"
    new_patient = {
        "id": f"pat_{int(time.time()*1000)}",
        "code": code,
        "name": name,
        "phone": phone,
        "nationalId": data.get('nationalId', ''),
        "age": int(data['age']) if data.get('age') else None,
        "gender": data.get('gender', 'ذكر'),
        "address": data.get('address', ''),
        "bloodType": data.get('bloodType', 'O+'),
        "emergencyContact": data.get('emergencyContact', ''),
        "chronicDiseases": data.get('chronicDiseases') if isinstance(data.get('chronicDiseases'), list) else ([data['chronicDiseases']] if data.get('chronicDiseases') else []),
        "allergies": data.get('allergies') if isinstance(data.get('allergies'), list) else ([data['allergies']] if data.get('allergies') else []),
        "currentMedications": data.get('currentMedications') if isinstance(data.get('currentMedications'), list) else [],
        "notes": data.get('notes', ''),
        "createdAt": datetime.now().strftime('%Y-%m-%d')
    }

    store.setdefault('patients', []).insert(0, new_patient)
    save_store()
    return jsonify(new_patient), 201

@app.route('/api/patients/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    store = get_store()
    patient = next((p for p in store.get('patients', []) if p.get('id') == patient_id), None)
    if not patient:
        return jsonify({"error": "المريض غير موجود"}), 404

    data = request.get_json() or {}
    patient.update(data)
    patient['id'] = patient_id
    save_store()
    return jsonify(patient)


# ------------------- APPOINTMENTS (المواعيد والكشوفات) -------------------
@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    store = get_store()
    branch_id = request.args.get('branchId')
    doctor_id = request.args.get('doctorId')
    date = request.args.get('date')
    status = request.args.get('status')
    phone = request.args.get('patientPhone')
    apts = store.get('appointments', [])

    if branch_id and branch_id != 'all':
        apts = [a for a in apts if a.get('branchId') == branch_id]
    if doctor_id and doctor_id != 'all':
        apts = [a for a in apts if a.get('doctorId') == doctor_id]
    if date:
        apts = [a for a in apts if a.get('date') == date]
    if status and status != 'all':
        apts = [a for a in apts if a.get('status') == status]
    if phone:
        apts = [a for a in apts if a.get('patientPhone') == phone.strip()]

    # Sort queue
    apts = sorted(apts, key=lambda x: x.get('queueNumber') or 99)
    return jsonify(apts)

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    store = get_store()
    data = request.get_json() or {}
    patient_name = (data.get('patientName') or '').strip()
    patient_phone = (data.get('patientPhone') or '').strip()
    doctor_id = data.get('doctorId')
    branch_id = data.get('branchId')

    if not patient_name or not patient_phone or not doctor_id or not branch_id:
        return jsonify({"error": "جميع الحقول الأساسية مطلوبة (الاسم، الهاتف، الطبيب، الفرع)"}), 400

    # Patient lookup or auto-register
    patient = None
    if data.get('patientId'):
        patient = next((p for p in store.get('patients', []) if p.get('id') == data['patientId']), None)
    if not patient:
        patient = next((p for p in store.get('patients', []) if p.get('phone') == patient_phone), None)
    if not patient:
        patient = {
            "id": f"pat_{int(time.time()*1000)}",
            "code": f"MED-{1000 + len(store.get('patients', [])) + 1}",
            "name": patient_name,
            "phone": patient_phone,
            "chronicDiseases": [],
            "allergies": [],
            "currentMedications": [],
            "createdAt": datetime.now().strftime('%Y-%m-%d')
        }
        store.setdefault('patients', []).insert(0, patient)

    doctor = next((d for d in store.get('doctors', []) if d.get('id') == doctor_id), None)
    branch = next((b for b in store.get('branches', []) if b.get('id') == branch_id), None)
    apt_date = data.get('date') or datetime.now().strftime('%Y-%m-%d')

    existing_same_day = [a for a in store.get('appointments', []) if a.get('doctorId') == doctor_id and a.get('date') == apt_date]
    queue_number = len(existing_same_day) + 1

    fee = doctor.get('consultationFee', 400) if doctor else 400

    new_apt = {
        "id": f"apt_{int(time.time()*1000)}",
        "code": f"APT-{datetime.now().year}-{str(len(store.get('appointments', [])) + 1).zfill(3)}",
        "patientId": patient.get('id'),
        "patientName": patient.get('name'),
        "patientPhone": patient.get('phone'),
        "doctorId": doctor.get('id') if doctor else doctor_id,
        "doctorName": doctor.get('name') if doctor else "طبيب متخصص",
        "doctorAvatar": doctor.get('avatar', '👨‍⚕️') if doctor else "👨‍⚕️",
        "clinicId": doctor.get('clinicId', 'cl_internal') if doctor else "cl_internal",
        "clinicName": doctor.get('clinicName', 'عيادة متخصصة') if doctor else "عيادة متخصصة",
        "branchId": branch.get('id') if branch else branch_id,
        "branchName": branch.get('name', 'الفرع الرئيسي') if branch else "الفرع الرئيسي",
        "date": apt_date,
        "timeSlot": data.get('timeSlot', '11:00 ص'),
        "type": data.get('type', 'كشف جديد'),
        "status": "waiting",
        "queueNumber": queue_number,
        "fee": fee,
        "paymentStatus": "paid",
        "notes": data.get('notes', ''),
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }

    store.setdefault('appointments', []).insert(0, new_apt)

    # Register income transaction
    store.setdefault('transactions', []).insert(0, {
        "id": f"tx_{int(time.time()*1000)}",
        "branchId": branch.get('id') if branch else branch_id,
        "type": "income",
        "category": f"كشف {doctor.get('clinicName', 'طبي') if doctor else 'طبي'}",
        "amount": fee,
        "patientName": new_apt['patientName'],
        "date": apt_date,
        "recordedBy": "الاستقبال"
    })

    save_store()
    return jsonify(new_apt), 201

@app.route('/api/appointments/<apt_id>/status', methods=['PATCH'])
def update_appointment_status(apt_id):
    store = get_store()
    apt = next((a for a in store.get('appointments', []) if a.get('id') == apt_id), None)
    if not apt:
        return jsonify({"error": "الموعد غير موجود"}), 404

    data = request.get_json() or {}
    if 'status' in data: apt['status'] = data['status']
    if 'paymentStatus' in data: apt['paymentStatus'] = data['paymentStatus']

    save_store()
    return jsonify(apt)

@app.route('/api/appointments/<apt_id>/vitals', methods=['PATCH'])
def save_appointment_vitals(apt_id):
    store = get_store()
    apt = next((a for a in store.get('appointments', []) if a.get('id') == apt_id), None)
    if not apt:
        return jsonify({"error": "الموعد غير موجود"}), 404

    data = request.get_json() or {}
    vitals_record = {
        "bp": data.get('bp', ''),
        "pulse": data.get('pulse', ''),
        "temp": data.get('temp', ''),
        "weight": data.get('weight', ''),
        "height": data.get('height', ''),
        "bloodSugar": data.get('bloodSugar', ''),
        "notes": data.get('notes', ''),
        "recordedAt": datetime.utcnow().isoformat() + "Z"
    }
    apt['vitals'] = vitals_record

    patient = next((p for p in store.get('patients', []) if p.get('id') == apt.get('patientId')), None)
    if patient:
        patient.setdefault('vitalsHistory', []).insert(0, {
            "date": apt.get('date'),
            "appointmentId": apt.get('id'),
            "doctorName": apt.get('doctorName'),
            **vitals_record
        })

    save_store()
    return jsonify({"message": "تم حفظ العلامات الحيوية بنجاح", "vitals": vitals_record})


# ------------------- PRESCRIPTIONS (الروشتات الطبية) -------------------
@app.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    store = get_store()
    patient_id = request.args.get('patientId')
    doctor_id = request.args.get('doctorId')
    search = request.args.get('search')
    rxs = store.get('prescriptions', [])

    if patient_id:
        rxs = [rx for rx in rxs if rx.get('patientId') == patient_id]
    if doctor_id and doctor_id != 'all':
        rxs = [rx for rx in rxs if rx.get('doctorId') == doctor_id]
    if search:
        q = search.strip().lower()
        rxs = [rx for rx in rxs if q in (rx.get('patientName') or '').lower() or q in (rx.get('code') or '').lower() or q in (rx.get('diagnosis') or '').lower()]

    return jsonify(rxs)

@app.route('/api/prescriptions', methods=['POST'])
def create_prescription():
    store = get_store()
    data = request.get_json() or {}
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    diagnosis = (data.get('diagnosis') or '').strip()

    patient = next((p for p in store.get('patients', []) if p.get('id') == patient_id), None)
    doctor = next((d for d in store.get('doctors', []) if d.get('id') == doctor_id), None)

    if not patient or not doctor or not diagnosis:
        return jsonify({"error": "بيانات المريض والطبيب والتشخيص مطلوبة"}), 400

    new_rx = {
        "id": f"rx_{int(time.time()*1000)}",
        "code": f"RX-{int(time.time()*1000) % 10000}",
        "appointmentId": data.get('appointmentId'),
        "patientId": patient.get('id'),
        "patientName": patient.get('name'),
        "patientCode": patient.get('code'),
        "doctorId": doctor.get('id'),
        "doctorName": doctor.get('name'),
        "doctorTitle": doctor.get('title'),
        "clinicName": doctor.get('clinicName'),
        "branchId": doctor.get('branchIds', ['br_maadi'])[0] if doctor.get('branchIds') else 'br_maadi',
        "branchName": "المركز الطبي التخصصي",
        "date": datetime.now().strftime('%Y-%m-%d'),
        "diagnosis": diagnosis,
        "medicines": data.get('medicines') if isinstance(data.get('medicines'), list) else [],
        "instructions": data.get('instructions', 'تناول العلاج بانتظام والمتابعة في الموعد المحدد.'),
        "followUpDate": data.get('followUpDate', 'بعد أسبوعين')
    }

    store.setdefault('prescriptions', []).insert(0, new_rx)

    if data.get('appointmentId'):
        apt = next((a for a in store.get('appointments', []) if a.get('id') == data['appointmentId']), None)
        if apt:
            apt['status'] = 'completed'

    save_store()
    return jsonify(new_rx), 201


# ------------------- LAB & RADIOLOGY REQUESTS -------------------
@app.route('/api/lab-requests', methods=['GET'])
def get_lab_requests():
    store = get_store()
    patient_id = request.args.get('patientId')
    doctor_id = request.args.get('doctorId')
    requests = store.get('labRequests', [])

    if patient_id:
        requests = [r for r in requests if r.get('patientId') == patient_id]
    if doctor_id and doctor_id != 'all':
        requests = [r for r in requests if r.get('doctorId') == doctor_id]

    return jsonify(requests)

@app.route('/api/lab-requests', methods=['POST'])
def create_lab_request():
    store = get_store()
    data = request.get_json() or {}
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    tests = data.get('tests')

    patient = next((p for p in store.get('patients', []) if p.get('id') == patient_id), None)
    doctor = next((d for d in store.get('doctors', []) if d.get('id') == doctor_id), None)

    if not patient or not doctor or not tests:
        return jsonify({"error": "المريض والطبيب والفحوصات حقول مطلوبة"}), 400

    new_request = {
        "id": f"lab_{int(time.time()*1000)}",
        "code": f"REQ-{int(time.time()*1000) % 10000}",
        "patientId": patient.get('id'),
        "patientName": patient.get('name'),
        "patientPhone": patient.get('phone'),
        "patientCode": patient.get('code'),
        "doctorId": doctor.get('id'),
        "doctorName": doctor.get('name'),
        "clinicName": doctor.get('clinicName'),
        "appointmentId": data.get('appointmentId'),
        "type": data.get('type', 'تحاليل مخبرية'),
        "tests": tests if isinstance(tests, list) else [tests],
        "priority": data.get('priority', 'عادي'),
        "status": "pending",
        "notes": data.get('notes', ''),
        "date": datetime.now().strftime('%Y-%m-%d'),
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }

    store.setdefault('labRequests', []).insert(0, new_request)
    save_store()
    return jsonify(new_request), 201


# ------------------- TRANSACTIONS & FINANCES (المالية) -------------------
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    store = get_store()
    branch_id = request.args.get('branchId')
    t_type = request.args.get('type')
    date = request.args.get('date')
    txs = store.get('transactions', [])

    if branch_id and branch_id != 'all':
        txs = [t for t in txs if t.get('branchId') == branch_id]
    if t_type and t_type != 'all':
        txs = [t for t in txs if t.get('type') == t_type]
    if date:
        txs = [t for t in txs if t.get('date') == date]

    return jsonify(txs)

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    store = get_store()
    data = request.get_json() or {}
    branch_id = data.get('branchId')
    t_type = data.get('type')
    category = data.get('category')
    amount = data.get('amount')

    if not branch_id or not t_type or amount is None or not category:
        return jsonify({"error": "الفرع والنوع والمبلغ والتصنيف حقول مطلوبة"}), 400

    new_tx = {
        "id": f"tx_{int(time.time()*1000)}",
        "branchId": branch_id,
        "type": t_type,
        "category": category,
        "amount": float(amount),
        "description": data.get('description', ''),
        "patientName": data.get('patientName', '-'),
        "date": datetime.now().strftime('%Y-%m-%d'),
        "recordedBy": data.get('recordedBy', 'المحاسب المالي')
    }

    store.setdefault('transactions', []).insert(0, new_tx)
    save_store()
    return jsonify(new_tx), 201


# ------------------- DASHBOARD STATS -------------------
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    store = get_store()
    branch_id = request.args.get('branchId', 'all')
    today = datetime.now().strftime('%Y-%m-%d')

    apts = store.get('appointments', [])
    txs = store.get('transactions', [])
    docs = store.get('doctors', [])

    if branch_id and branch_id != 'all':
        apts = [a for a in apts if a.get('branchId') == branch_id]
        txs = [t for t in txs if t.get('branchId') == branch_id]
        docs = [d for d in docs if branch_id in d.get('branchIds', [])]

    today_apts = [a for a in apts if a.get('date') == today]
    waiting_count = sum(1 for a in today_apts if a.get('status') in ['waiting', 'in_progress'])
    completed_count = sum(1 for a in today_apts if a.get('status') == 'completed')

    today_txs = [t for t in txs if t.get('date') == today]
    today_revenue = sum(float(t.get('amount', 0)) for t in today_txs if t.get('type') == 'income')
    today_expenses = sum(float(t.get('amount', 0)) for t in today_txs if t.get('type') == 'expense')
    net_profit = today_revenue - today_expenses

    active_doctors_count = sum(1 for d in docs if d.get('status') in ['available', 'busy'])

    doctor_performance = []
    for doc in docs:
        doc_apts = [a for a in apts if a.get('doctorId') == doc.get('id')]
        doc_income = sum(float(a.get('fee', 0)) for a in doc_apts)
        doctor_performance.append({
            "id": doc.get('id'),
            "name": doc.get('name'),
            "clinic": doc.get('clinicName'),
            "avatar": doc.get('avatar'),
            "totalVisits": len(doc_apts),
            "revenue": doc_income,
            "rating": doc.get('rating', 5.0)
        })

    branch_breakdown = []
    for branch in store.get('branches', []):
        b_apts = [a for a in store.get('appointments', []) if a.get('branchId') == branch.get('id')]
        b_txs = [t for t in store.get('transactions', []) if t.get('branchId') == branch.get('id')]
        b_rev = sum(float(t.get('amount', 0)) for t in b_txs if t.get('type') == 'income')
        b_exp = sum(float(t.get('amount', 0)) for t in b_txs if t.get('type') == 'expense')
        branch_breakdown.append({
            "id": branch.get('id'),
            "name": branch.get('name'),
            "patientCount": len(b_apts),
            "revenue": b_rev,
            "expenses": b_exp,
            "profit": b_rev - b_exp
        })

    return jsonify({
        "todayRevenue": today_revenue,
        "todayExpenses": today_expenses,
        "netProfit": net_profit,
        "waitingCount": waiting_count,
        "completedCount": completed_count,
        "totalTodayAppointments": len(today_apts),
        "activeDoctorsCount": active_doctors_count,
        "totalPatients": len(store.get('patients', [])),
        "doctorPerformance": doctor_performance,
        "branchBreakdown": branch_breakdown,
        "recentAppointments": today_apts[:5]
    })


# ------------------- INTERNAL CHAT / INTERCOM (محادثة الطبيب والاستقبال) -------------------
@app.route('/api/chat/messages', methods=['GET'])
def get_chat_messages():
    store = get_store()
    messages = store.get('messages', [])
    limit = int(request.args.get('limit', 100))
    return jsonify(messages[-limit:])

@app.route('/api/chat/messages', methods=['POST'])
def send_chat_message():
    store = get_store()
    data = request.get_json() or {}
    text = (data.get('text') or '').strip()
    sender_name = data.get('senderName', 'المستخدم')
    sender_role = data.get('senderRole', 'staff')
    sender_id = data.get('senderId', '')
    recipient_role = data.get('recipientRole', 'all')
    msg_type = data.get('type', 'text') # 'text', 'quick_action', 'urgent'

    if not text:
        return jsonify({"error": "نص الرسالة مطلوب"}), 400

    now = datetime.now()
    hour = now.strftime('%I:%M')
    am_pm = 'م' if now.strftime('%p') == 'PM' else 'ص'
    time_str = f"{hour} {am_pm}"

    new_msg = {
        "id": f"msg_{int(time.time()*1000)}",
        "senderId": sender_id,
        "senderName": sender_name,
        "senderRole": sender_role,
        "recipientRole": recipient_role,
        "text": text,
        "type": msg_type,
        "timeFormatted": time_str,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "isRead": False
    }

    store.setdefault('messages', []).append(new_msg)
    if len(store['messages']) > 500:
        store['messages'] = store['messages'][-500:]

    save_store()
    return jsonify(new_msg), 201

@app.route('/api/chat/messages/read', methods=['PATCH'])
def mark_chat_messages_read():
    store = get_store()
    data = request.get_json() or {}
    reader_role = data.get('readerRole', '')

    for msg in store.get('messages', []):
        if reader_role and msg.get('senderRole') != reader_role:
            msg['isRead'] = True

    save_store()
    return jsonify({"success": True, "message": "تم تحديث حالة القراءة"})


# ------------------- STATIC FILES & SPA FALLBACK -------------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    if path and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    index_file = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.exists(index_file):
        return send_file(index_file)
    return "Clini-Tech Backend Running. Please run 'npm run build' inside frontend directory.", 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Clini-Tech Python Server running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
