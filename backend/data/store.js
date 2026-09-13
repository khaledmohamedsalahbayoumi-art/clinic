const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'clinic_data.json');

// Initial seed data with rich, realistic medical content
const initialData = {
  branches: [
    { id: 'br_maadi', name: 'فرع المعادي الرئيسي', address: 'شارع النصر، دجلة، المعادي، القاهرة', phone: '0225198001', isMain: true },
    { id: 'br_nasr_city', name: 'فرع مدينة نصر', address: 'شارع عباس العقاد، بجوار الجامعة العمالية', phone: '0222718002', isMain: false },
    { id: 'br_tagamoa', name: 'فرع التجمع الخامس', address: 'مجمع الميديكال بارك، شارع التسعين الشمالي', phone: '0228128003', isMain: false }
  ],
  clinics: [
    { id: 'cl_internal', name: 'عيادة الباطنة والجهاز الهضمي', icon: '🩺' },
    { id: 'cl_ortho', name: 'عيادة العظام والمفاصل', icon: '🦴' },
    { id: 'cl_pediatric', name: 'عيادة طب الأطفال وحديثي الولادة', icon: '👶' },
    { id: 'cl_cardio', name: 'عيادة القلب والأوعية الدموية', icon: '❤️' },
    { id: 'cl_derma', name: 'عيادة الجلدية والتجميل والليزر', icon: '✨' },
    { id: 'cl_dentistry', name: 'عيادة طب وجراحة الأسنان', icon: '🦷' }
  ],
  doctors: [
    {
      id: 'doc_1',
      name: 'د. أحمد السقا',
      title: 'استشاري أول أمراض الباطنة والجهاز الهضمي والمناظير',
      clinicId: 'cl_internal',
      clinicName: 'عيادة الباطنة',
      branchIds: ['br_maadi', 'br_tagamoa'],
      consultationFee: 450,
      followUpFee: 150,
      rating: 4.9,
      reviewsCount: 142,
      phone: '01009876541',
      avatar: '👨‍⚕️',
      status: 'available',
      experienceYears: 18,
      education: 'دكتوراه الباطنة العامة - جامعة عين شمس، زميل الكلية الملكية البريطانية',
      schedule: [
        { day: 'السبت', time: '10:00 ص - 02:00 م', branchId: 'br_maadi' },
        { day: 'الإثنين', time: '05:00 م - 09:00 م', branchId: 'br_maadi' },
        { day: 'الأربعاء', time: '10:00 ص - 02:00 م', branchId: 'br_tagamoa' }
      ]
    },
    {
      id: 'doc_2',
      name: 'د. سارة المنشاوي',
      title: 'أخصائية طب الأطفال والرضع وحديثي الولادة',
      clinicId: 'cl_pediatric',
      clinicName: 'عيادة الأطفال',
      branchIds: ['br_maadi', 'br_nasr_city'],
      consultationFee: 350,
      followUpFee: 100,
      rating: 4.95,
      reviewsCount: 189,
      phone: '01009876542',
      avatar: '👩‍⚕️',
      status: 'available',
      experienceYears: 12,
      education: 'ماجستير طب الأطفال وحديثي الولادة - جامعة القاهرة',
      schedule: [
        { day: 'الأحد', time: '12:00 م - 05:00 م', branchId: 'br_maadi' },
        { day: 'الثلاثاء', time: '12:00 م - 05:00 م', branchId: 'br_nasr_city' },
        { day: 'الخميس', time: '01:00 م - 06:00 م', branchId: 'br_maadi' }
      ]
    },
    {
      id: 'doc_3',
      name: 'د. محمود فهمي',
      title: 'استشاري جراحة العظام والمفاصل والمناظير والعمود الفقري',
      clinicId: 'cl_ortho',
      clinicName: 'عيادة العظام',
      branchIds: ['br_nasr_city', 'br_tagamoa'],
      consultationFee: 500,
      followUpFee: 150,
      rating: 4.88,
      reviewsCount: 97,
      phone: '01009876543',
      avatar: '👨‍⚕️',
      status: 'available',
      experienceYears: 20,
      education: 'دكتوراه جراحة العظام - جامعة الإسكندرية، عضو الجمعية السويسرية للعظام',
      schedule: [
        { day: 'السبت', time: '04:00 م - 09:00 م', branchId: 'br_nasr_city' },
        { day: 'الإثنين', time: '04:00 م - 09:00 م', branchId: 'br_tagamoa' },
        { day: 'الخميس', time: '04:00 م - 09:00 م', branchId: 'br_nasr_city' }
      ]
    },
    {
      id: 'doc_4',
      name: 'د. رانيا الشريف',
      title: 'استشارية الأمراض الجلدية والتجميل والعلاج بالليزر',
      clinicId: 'cl_derma',
      clinicName: 'عيادة الجلدية',
      branchIds: ['br_maadi', 'br_tagamoa'],
      consultationFee: 400,
      followUpFee: 150,
      rating: 4.92,
      reviewsCount: 165,
      phone: '01009876544',
      avatar: '👩‍⚕️',
      status: 'busy',
      experienceYears: 14,
      education: 'ماجستير الأمراض الجلدية والتناسلية والليزر - قصر العيني',
      schedule: [
        { day: 'الأحد', time: '02:00 م - 08:00 م', branchId: 'br_maadi' },
        { day: 'الأربعاء', time: '02:00 م - 08:00 م', branchId: 'br_tagamoa' }
      ]
    },
    {
      id: 'doc_5',
      name: 'د. كريم عبد العزيز',
      title: 'استشاري أمراض القلب والأوعية الدموية والقسطرة التداخلية',
      clinicId: 'cl_cardio',
      clinicName: 'عيادة القلب',
      branchIds: ['br_maadi', 'br_nasr_city', 'br_tagamoa'],
      consultationFee: 550,
      followUpFee: 200,
      rating: 4.97,
      reviewsCount: 210,
      phone: '01009876545',
      avatar: '👨‍⚕️',
      status: 'available',
      experienceYears: 22,
      education: 'دكتوراه أمراض القلب والأوعية الدموية - معهد القلب القومي',
      schedule: [
        { day: 'السبت', time: '01:00 م - 06:00 م', branchId: 'br_maadi' },
        { day: 'الثلاثاء', time: '01:00 م - 06:00 م', branchId: 'br_nasr_city' }
      ]
    },
    {
      id: 'doc_6',
      name: 'د. ياسمين عادل',
      title: 'أخصائية تجميل وزراعة الأسنان وعلاج الجذور',
      clinicId: 'cl_dentistry',
      clinicName: 'عيادة الأسنان',
      branchIds: ['br_nasr_city'],
      consultationFee: 300,
      followUpFee: 100,
      rating: 4.89,
      reviewsCount: 88,
      phone: '01009876546',
      avatar: '👩‍⚕️',
      status: 'available',
      experienceYears: 9,
      education: 'ماجستير جراحة وتجميل الأسنان - جامعة عين شمس',
      schedule: [
        { day: 'الإثنين', time: '11:00 ص - 04:00 م', branchId: 'br_nasr_city' },
        { day: 'الأربعاء', time: '11:00 ص - 04:00 م', branchId: 'br_nasr_city' }
      ]
    }
  ],
  patients: [
    {
      id: 'pat_1',
      code: 'MED-1001',
      name: 'محمد عبد الرحمن محمود',
      phone: '01011223344',
      nationalId: '29001011234567',
      age: 46,
      gender: 'ذكر',
      address: 'شارع النصر، المعادي، القاهرة',
      bloodType: 'O+',
      emergencyContact: 'زوجته: 01099887766',
      chronicDiseases: ['ارتفاع ضغط الدم (Hypertension)', 'السكري النوع الثاني (Diabetes Type 2)'],
      allergies: ['حساسية من البنسلين (Penicillin Allergy)'],
      currentMedications: [
        { name: 'كونكور 5 ملغ (Concor 5mg)', frequency: 'قرص صباحاً يومياً' },
        { name: 'جلوكوفاج 1000 ملغ (Glucophage 1000mg)', frequency: 'قرص بعد الغداء والعشاء' }
      ],
      notes: 'مريض منتظم بمتابعة وظائف الكلى وتحليل السكر التراكمي دورياً كل 3 أشهر.',
      createdAt: '2025-11-10'
    },
    {
      id: 'pat_2',
      code: 'MED-1002',
      name: 'فاطمة حسن إبراهيم',
      phone: '01122334455',
      nationalId: '29505051234568',
      age: 32,
      gender: 'أنثى',
      address: 'شارع الطيران، مدينة نصر، القاهرة',
      bloodType: 'A+',
      emergencyContact: 'والدها: 01188776655',
      chronicDiseases: ['الربو الشعبي والتحسسي (Bronchial Asthma)'],
      allergies: ['حساسية من الأسبرين ومضادات الالتهاب غير الستيرويدية (NSAIDs)', 'حساسية من الفول السوداني'],
      currentMedications: [
        { name: 'سيمبيكورت بخاخ (Symbicort Inhaler)', frequency: 'بختين صباحاً ومساءً عند اللزوم' },
        { name: 'تلفاست 180 ملغ (Telfast 180mg)', frequency: 'قرص مساءً قبل النوم' }
      ],
      notes: 'تجنب تماماً وصف أدوية تحتوي على الأسبرين أو البروفين.',
      createdAt: '2025-12-04'
    },
    {
      id: 'pat_3',
      code: 'MED-1003',
      name: 'عمر شريف الدسوقي',
      phone: '01233445566',
      nationalId: '31802021234569',
      age: 7,
      gender: 'ذكر',
      address: 'الحي الثاني، التجمع الخامس',
      bloodType: 'B+',
      emergencyContact: 'والدته: 01277665544',
      chronicDiseases: ['أنيميا نقص الحديد (Iron Deficiency Anemia)'],
      allergies: ['لا توجد حساسية دوائية معروفة'],
      currentMedications: [
        { name: 'فيروجلوبين شراب (Feroglobin Syrup)', frequency: '5 مل مرة واحدة يومياً بعد الأكل' }
      ],
      notes: 'متابع في عيادة طب الأطفال للتطور والنمو.',
      createdAt: '2026-01-15'
    },
    {
      id: 'pat_4',
      code: 'MED-1004',
      name: 'مروة مصطفى النجار',
      phone: '01044556677',
      nationalId: '28809091234570',
      age: 41,
      gender: 'أنثى',
      address: 'دجلة المعادي، بجوار كارفور',
      bloodType: 'AB+',
      emergencyContact: 'زوجها: 01033221100',
      chronicDiseases: ['قصور نشاط الغدة الدرقية (Hypothyroidism)'],
      allergies: ['حساسية جلدية من مركبات السلفا (Sulfa)'],
      currentMedications: [
        { name: 'إلتروكسين 100 ميكروجرام (Eltroxin 100mcg)', frequency: 'قرص على الريق قبل الإفطار بساعة' }
      ],
      notes: 'تحليل TSH دوري كل 6 أشهر.',
      createdAt: '2026-02-01'
    }
  ],
  appointments: [
    {
      id: 'apt_1',
      code: 'APT-2026-01',
      patientId: 'pat_1',
      patientName: 'محمد عبد الرحمن محمود',
      patientPhone: '01011223344',
      doctorId: 'doc_1',
      doctorName: 'د. أحمد السقا',
      doctorAvatar: '👨‍⚕️',
      clinicId: 'cl_internal',
      clinicName: 'عيادة الباطنة',
      branchId: 'br_maadi',
      branchName: 'فرع المعادي الرئيسي',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:30 ص',
      type: 'كشف جديد',
      status: 'waiting', // waiting in clinic queue
      queueNumber: 1,
      fee: 450,
      paymentStatus: 'paid',
      notes: 'يعاني من آلام متكررة في المعدة وارتجاع مريئي'
    },
    {
      id: 'apt_2',
      code: 'APT-2026-02',
      patientId: 'pat_2',
      patientName: 'فاطمة حسن إبراهيم',
      patientPhone: '01122334455',
      doctorId: 'doc_1',
      doctorName: 'د. أحمد السقا',
      doctorAvatar: '👨‍⚕️',
      clinicId: 'cl_internal',
      clinicName: 'عيادة الباطنة',
      branchId: 'br_maadi',
      branchName: 'فرع المعادي الرئيسي',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '11:00 ص',
      type: 'متابعة سكر وضغط',
      status: 'in_progress', // currently inside doctor's office
      queueNumber: 2,
      fee: 150,
      paymentStatus: 'paid',
      notes: 'مراجعة قراءات الضغط الأسبوعية'
    },
    {
      id: 'apt_3',
      code: 'APT-2026-03',
      patientId: 'pat_3',
      patientName: 'عمر شريف الدسوقي',
      patientPhone: '01233445566',
      doctorId: 'doc_2',
      doctorName: 'د. سارة المنشاوي',
      doctorAvatar: '👩‍⚕️',
      clinicId: 'cl_pediatric',
      clinicName: 'عيادة الأطفال',
      branchId: 'br_maadi',
      branchName: 'فرع المعادي الرئيسي',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '12:30 م',
      type: 'فحص دوري',
      status: 'waiting',
      queueNumber: 1,
      fee: 350,
      paymentStatus: 'paid',
      notes: 'متابعة تحليل الهيموجلوبين والنمو'
    },
    {
      id: 'apt_4',
      code: 'APT-2026-04',
      patientId: 'pat_4',
      patientName: 'مروة مصطفى النجار',
      patientPhone: '01044556677',
      doctorId: 'doc_3',
      doctorName: 'د. محمود فهمي',
      doctorAvatar: '👨‍⚕️',
      clinicId: 'cl_ortho',
      clinicName: 'عيادة العظام',
      branchId: 'br_nasr_city',
      branchName: 'فرع مدينة نصر',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '04:30 م',
      type: 'كشف جديد',
      status: 'confirmed',
      queueNumber: 1,
      fee: 500,
      paymentStatus: 'unpaid',
      notes: 'خشونة وألم مفصل الركبة اليمنى'
    },
    {
      id: 'apt_5',
      code: 'APT-2026-05',
      patientId: 'pat_1',
      patientName: 'محمد عبد الرحمن محمود',
      patientPhone: '01011223344',
      doctorId: 'doc_5',
      doctorName: 'د. كريم عبد العزيز',
      doctorAvatar: '👨‍⚕️',
      clinicId: 'cl_cardio',
      clinicName: 'عيادة القلب',
      branchId: 'br_maadi',
      branchName: 'فرع المعادي الرئيسي',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '02:00 م',
      type: 'رسم قلب وموجات صوتية',
      status: 'completed',
      queueNumber: 1,
      fee: 750,
      paymentStatus: 'paid',
      notes: 'تم عمل إيكو ورسم قلب واطمئنان على كفاءة العضلة'
    }
  ],
  prescriptions: [
    {
      id: 'rx_1',
      code: 'RX-8841',
      patientId: 'pat_1',
      patientName: 'محمد عبد الرحمن محمود',
      patientCode: 'MED-1001',
      doctorId: 'doc_1',
      doctorName: 'د. أحمد السقا',
      doctorTitle: 'استشاري أول أمراض الباطنة والجهاز الهضمي',
      clinicName: 'عيادة الباطنة والجهاز الهضمي',
      branchId: 'br_maadi',
      branchName: 'فرع المعادي الرئيسي',
      date: new Date().toISOString().split('T')[0],
      diagnosis: 'التهاب معدي حاد مع ارتجاع مريئي معدي (Acute Gastritis & GERD)',
      medicines: [
        { name: 'نيكسيوم 40 ملغ (Nexium 40mg)', form: 'أقراص', dosage: 'قرص واحد يومياً على الريق قبل الإفطار بنصف ساعة', duration: 'لمدة شهر' },
        { name: 'موتيليوم 10 ملغ (Motilium 10mg)', form: 'أقراص', dosage: 'قرص واحد قبل الوجبات الرئيسية بـ 15 دقيقة (3 مرات يومياً)', duration: 'لمدة 14 يوماً' },
        { name: 'جافيسكون أدفانس (Gaviscon Advance)', form: 'شراب', dosage: 'ملعقة كبيرة بعد الوجبات وقبل النوم', duration: 'عند الشعور بالحموضة' }
      ],
      instructions: 'الابتعاد التام عن المقليات، المسبكات، التوابل الحارة، والشاي والقهوة على معدة فارغة. تقسيم الوجبات إلى 5 وجبات خفيفة وتجنب النوم بعد الأكل مباشرة.',
      followUpDate: 'بعد أسبوعين للمتابعة وتقييم التحسن'
    },
    {
      id: 'rx_2',
      code: 'RX-8840',
      patientId: 'pat_2',
      patientName: 'فاطمة حسن إبراهيم',
      patientCode: 'MED-1002',
      doctorId: 'doc_1',
      doctorName: 'د. أحمد السقا',
      doctorTitle: 'استشاري أول أمراض الباطنة والجهاز الهضمي',
      clinicName: 'عيادة الباطنة',
      branchId: 'br_maadi',
      branchName: 'فرع المعادي الرئيسي',
      date: '2026-03-01',
      diagnosis: 'متابعة دورية مستقرة - ضبط جرعات السكري',
      medicines: [
        { name: 'جلوكوفاج 1000 ملغ (Glucophage)', form: 'أقراص', dosage: 'قرص مع وجبة الغداء وقرص مع العشاء', duration: 'علاج مستمر' },
        { name: 'فيتامين ب المركب نيروتون (Neuroton)', form: 'أقراص', dosage: 'قرص مرة واحدة يومياً بعد الإفطار', duration: 'لمدة شهرين' }
      ],
      instructions: 'الحفاظ على المشي اليومي نصف ساعة ومراقبة قياس السكر الصائم والفاطر في جدول أسبوعي.',
      followUpDate: 'إعادة تحليل التراكمي HbA1c بعد شهرين'
    }
  ],
  transactions: [
    { id: 'tx_1', branchId: 'br_maadi', type: 'income', category: 'كشف باطنة', amount: 450, patientName: 'محمد عبد الرحمن محمود', date: new Date().toISOString().split('T')[0], recordedBy: 'سلمى إبراهيم (الاستقبال)' },
    { id: 'tx_2', branchId: 'br_maadi', type: 'income', category: 'متابعة باطنة', amount: 150, patientName: 'فاطمة حسن إبراهيم', date: new Date().toISOString().split('T')[0], recordedBy: 'سلمى إبراهيم (الاستقبال)' },
    { id: 'tx_3', branchId: 'br_maadi', type: 'income', category: 'كشف أطفال', amount: 350, patientName: 'عمر شريف الدسوقي', date: new Date().toISOString().split('T')[0], recordedBy: 'سلمى إبراهيم (الاستقبال)' },
    { id: 'tx_4', branchId: 'br_maadi', type: 'income', category: 'فحص رسم قلب وإيكو', amount: 750, patientName: 'محمد عبد الرحمن محمود', date: new Date().toISOString().split('T')[0], recordedBy: 'سلمى إبراهيم (الاستقبال)' },
    { id: 'tx_5', branchId: 'br_nasr_city', type: 'income', category: 'كشف عظام', amount: 500, patientName: 'سعيد عبد الله', date: new Date().toISOString().split('T')[0], recordedBy: 'مروان فتحي (الاستقبال)' },
    { id: 'tx_6', branchId: 'br_tagamoa', type: 'income', category: 'جلسة ليزر جلدية', amount: 1200, patientName: 'ندى الشيمي', date: new Date().toISOString().split('T')[0], recordedBy: 'نورهان سعيد (الاستقبال)' },
    { id: 'tx_7', branchId: 'br_maadi', type: 'expense', category: 'مستلزمات طبية ومعقمات', amount: 480, patientName: '-', date: new Date().toISOString().split('T')[0], recordedBy: 'أ. هيثم كمال (المحاسب)' },
    { id: 'tx_8', branchId: 'br_nasr_city', type: 'expense', category: 'صيانة وتكييفات', amount: 650, patientName: '-', date: new Date().toISOString().split('T')[0], recordedBy: 'أ. هيثم كمال (المحاسب)' }
  ],
  users: [
    {
      id: 'usr_1',
      username: 'owner',
      password: 'admin123',
      name: 'د. خالد السقا',
      role: 'owner',
      title: 'المالك والمشرف العام للمركز',
      branchId: 'all',
      phone: '01012345671',
      permissions: [
        'dashboard:view',
        'queue:view',
        'queue:manage',
        'patients:view',
        'patients:sensitive',
        'patients:create',
        'prescriptions:view',
        'prescriptions:create',
        'finances:view',
        'finances:create',
        'settings:manage'
      ],
      createdAt: '2026-01-01'
    },
    {
      id: 'usr_2',
      username: 'manager_maadi',
      password: '123456',
      name: 'أ. طارق رضوان',
      role: 'manager',
      title: 'مدير فرع المعادي',
      branchId: 'br_maadi',
      phone: '01012345672',
      permissions: [
        'dashboard:view',
        'queue:view',
        'queue:manage',
        'patients:view',
        'patients:sensitive',
        'patients:create',
        'prescriptions:view',
        'finances:view',
        'finances:create'
      ],
      createdAt: '2026-01-05'
    },
    {
      id: 'usr_3',
      username: 'reception',
      password: '123456',
      name: 'سلمى إبراهيم',
      role: 'reception',
      title: 'مسؤولة الاستقبال والتحصيل',
      branchId: 'br_maadi',
      phone: '01012345673',
      permissions: [
        'dashboard:view',
        'queue:view',
        'queue:manage',
        'patients:view',
        'patients:create'
      ],
      createdAt: '2026-01-10'
    },
    {
      id: 'usr_4',
      username: 'dr_ahmed',
      password: '123456',
      name: 'د. أحمد السقا',
      role: 'doctor',
      doctorId: 'doc_1',
      title: 'استشاري أول أمراض الباطنة',
      branchId: 'br_maadi',
      phone: '01009876541',
      permissions: [
        'queue:view',
        'queue:manage',
        'patients:view',
        'patients:sensitive',
        'prescriptions:view',
        'prescriptions:create'
      ],
      createdAt: '2026-01-12'
    },
    {
      id: 'usr_5',
      username: 'accountant',
      password: '123456',
      name: 'أ. هيثم كمال',
      role: 'accountant',
      title: 'المحاسب المالي',
      branchId: 'br_maadi',
      phone: '01012345675',
      permissions: [
        'dashboard:view',
        'finances:view',
        'finances:create'
      ],
      createdAt: '2026-01-15'
    }
  ]
};

// Memory store initialized from disk or default
let memoryStore = null;

function loadData() {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      memoryStore = JSON.parse(content);
      if (!memoryStore.users || memoryStore.users.length === 0) {
        memoryStore.users = JSON.parse(JSON.stringify(initialData.users));
        saveData();
      }
    } else {
      memoryStore = JSON.parse(JSON.stringify(initialData));
      saveData();
    }
  } catch (err) {
    console.error('Error loading data file, falling back to initial data:', err);
    memoryStore = JSON.parse(JSON.stringify(initialData));
  }
  return memoryStore;
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving data to file:', err);
  }
}

module.exports = {
  loadData,
  saveData,
  getStore: () => loadData()
};

