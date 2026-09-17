// Bilingual (Arabic / English) Medical Prescription Translation Dictionary & Formatter

const DOCTOR_NAMES = {
  'د. أحمد السقا': 'Dr. Ahmed El-Sakka',
  'د. سارة المنشاوي': 'Dr. Sarah El-Minshawi',
  'د. محمود فهمي': 'Dr. Mahmoud Fahmy',
  'د. كريم عبد العزيز': 'Dr. Karim Abdel Aziz',
  'د. ياسمين عادل': 'Dr. Yasmine Adel'
};

const DOCTOR_TITLES = {
  'استشاري أول أمراض الباطنة والجهاز الهضمي والمناظير': 'Senior Consultant of Internal Medicine & Gastroenterology',
  'استشاري أول أمراض الباطنة والجهاز الهضمي': 'Senior Consultant of Internal Medicine & Gastroenterology',
  'أخصائية طب الأطفال والرضع وحديثي الولادة': 'Specialist in Pediatrics & Neonatology',
  'أخصائية طب الأطفال': 'Specialist in Pediatrics',
  'استشاري جراحة العظام والمفاصل والمناظير والعمود الفقري': 'Consultant Orthopedic, Arthroscopy & Spine Surgeon',
  'استشاري جراحة العظام': 'Consultant Orthopedic Surgeon',
  'استشاري أمراض القلب والأوعية الدموية والقسطرة التداخلية': 'Consultant of Cardiology & Interventional Catheterization',
  'استشاري أمراض القلب': 'Consultant Cardiologist',
  'أخصائية تجميل وزراعة الأسنان وعلاج الجذور': 'Specialist in Cosmetic & Implant Dentistry',
  'أخصائية تجميل الأسنان': 'Specialist in Dental Surgery'
};

const CLINIC_NAMES = {
  'عيادة الباطنة والجهاز الهضمي': 'Internal Medicine & Gastroenterology Clinic',
  'عيادة الباطنة': 'Internal Medicine Clinic',
  'عيادة طب الأطفال وحديثي الولادة': 'Pediatric & Neonatal Clinic',
  'عيادة الأطفال': 'Pediatric Clinic',
  'عيادة العظام والمفاصل': 'Orthopedics & Joint Clinic',
  'عيادة العظام': 'Orthopedics Clinic',
  'عيادة القلب والأوعية الدموية': 'Cardiology & Vascular Clinic',
  'عيادة القلب': 'Cardiology Clinic',
  'عيادة الجلدية والتجميل والليزر': 'Dermatology & Cosmetic Clinic',
  'عيادة الجلدية': 'Dermatology Clinic',
  'عيادة طب وجراحة الأسنان': 'Dental & Oral Surgery Clinic',
  'عيادة الأسنان': 'Dental Clinic'
};

const BRANCH_NAMES = {
  'فرع المعادي الرئيسي': 'Maadi Main Branch',
  'الفرع الرئيسي': 'Main Branch',
  'فرع التجمع الخامس': 'Fifth Settlement Branch',
  'فرع مدينة نصر': 'Nasr City Branch'
};

const MED_FORMS = {
  'أقراص': 'Tablets',
  'قرص': 'Tablet',
  'شراب': 'Syrup',
  'كبسولات': 'Capsules',
  'كبسولة': 'Capsule',
  'حقن': 'Injection',
  'حقنة': 'Injection',
  'نقط': 'Drops',
  'مرهم': 'Ointment',
  'كريم': 'Cream',
  'بخاخ': 'Inhaler / Spray',
  'فوار': 'Effervescent Sachets',
  'لبوس': 'Suppository',
  'محلول': 'Solution'
};

const DOSAGE_TRANSLATIONS = {
  'قرص واحد يومياً على الريق قبل الإفطار بنصف ساعة': '1 tablet daily on an empty stomach 30 mins before breakfast',
  'قرص واحد قبل الوجبات الرئيسية بـ 15 دقيقة (3 مرات يومياً)': '1 tablet 15 mins before main meals (3 times daily)',
  'ملعقة كبيرة بعد الوجبات وقبل النوم': '1 tablespoon after meals and at bedtime',
  'قرص مع وجبة الغداء وقرص مع العشاء': '1 tablet with lunch and 1 tablet with dinner',
  'قرص مرة واحدة يومياً بعد الإفطار': '1 tablet once daily after breakfast',
  'قرص عند اللزوم': '1 tablet as needed',
  'قرص كل 12 ساعة بعد الأكل': '1 tablet every 12 hours after meals',
  'قرص كل 8 ساعات': '1 tablet every 8 hours',
  '5 مل مرة واحدة يومياً بعد الأكل': '5 ml once daily after meals',
  'قرص على الريق قبل الإفطار بساعة': '1 tablet on an empty stomach 1 hour before breakfast',
  'بختين صباحاً ومساءً عند اللزوم': '2 puffs morning and evening as needed'
};

const DURATION_TRANSLATIONS = {
  'لمدة شهر': 'For 1 month',
  'لمدة 14 يوماً': 'For 14 days',
  'عند الشعور بالحموضة': 'As needed for heartburn',
  'علاج مستمر': 'Continuous treatment',
  'لمدة شهرين': 'For 2 months',
  'لمدة أسبوع': 'For 1 week',
  'لمدة 10 أيام': 'For 10 days',
  'لمدة 5 أيام': 'For 5 days',
  'عند اللزوم': 'As needed'
};

const INSTRUCTION_TRANSLATIONS = {
  'الابتعاد التام عن المقليات، المسبكات، التوابل الحارة، والشاي والقهوة على معدة فارغة. تقسيم الوجبات إلى 5 وجبات خفيفة وتجنب النوم بعد الأكل مباشرة.':
    'Avoid fried, fatty, and spicy foods. Avoid tea and coffee on an empty stomach. Divide meals into 5 small light meals and avoid lying down immediately after eating.',
  'الحفاظ على المشي اليومي نصف ساعة ومراقبة قياس السكر الصائم والفاطر في جدول أسبوعي.':
    'Maintain a daily 30-minute walk and monitor fasting and postprandial blood sugar in a weekly log.'
};

const FOLLOWUP_TRANSLATIONS = {
  'بعد أسبوعين للمتابعة وتقييم التحسن': 'After 2 weeks for follow-up and evaluation',
  'إعادة تحليل التراكمي HbA1c بعد شهرين': 'Repeat HbA1c test after 2 months',
  'بعد أسبوع': 'After 1 week',
  'بعد شهر': 'After 1 month',
  'حسب موعد الاستشارة': 'As scheduled for consultation'
};

const PATIENT_NAMES = {
  'محمد عبد الرحمن محمود': 'Mohamed Abdelrahman Mahmoud',
  'فاطمة حسن إبراهيم': 'Fatma Hassan Ibrahim',
  'عمر شريف الدسوقي': 'Omar Sherif El-Desouky',
  'مروة مصطفى النجار': 'Marwa Mostafa El-Naggar'
};

/**
 * Format Doctor Name based on language
 */
export function formatDoctorName(name = '', lang = 'ar') {
  if (lang === 'ar') return name;
  if (DOCTOR_NAMES[name]) return DOCTOR_NAMES[name];
  // Fallback: replace د. with Dr.
  return name.replace(/^د\.\s*/, 'Dr. ');
}

/**
 * Format Doctor Title based on language
 */
export function formatDoctorTitle(title = '', lang = 'ar') {
  if (lang === 'ar') return title;
  return DOCTOR_TITLES[title] || title;
}

/**
 * Format Clinic Name based on language
 */
export function formatClinicName(clinic = '', lang = 'ar') {
  if (lang === 'ar') return clinic;
  return CLINIC_NAMES[clinic] || clinic;
}

/**
 * Format Branch Name based on language
 */
export function formatBranchName(branch = '', lang = 'ar') {
  if (lang === 'ar') return branch || 'الفرع الرئيسي';
  return BRANCH_NAMES[branch] || 'Main Center';
}

/**
 * Format Patient Name based on language
 */
export function formatPatientName(name = '', lang = 'ar') {
  if (lang === 'ar') return name;
  return PATIENT_NAMES[name] || name;
}

/**
 * Format Diagnosis cleanly separating bilingual parts
 */
export function formatDiagnosis(diagnosis = '', lang = 'ar') {
  if (!diagnosis) return '';
  // Check if string contains both Arabic and English e.g. "التهاب معدي حاد (Acute Gastritis & GERD)"
  const match = diagnosis.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const arPart = match[1].trim();
    const enPart = match[2].trim();
    return lang === 'ar' ? arPart : enPart;
  }
  return diagnosis;
}

/**
 * Format Medicine Name cleanly separating Arabic and English names
 */
export function formatMedicineName(name = '', lang = 'ar') {
  if (!name) return '';
  // Check for pattern like: "نيكسيوم 40 ملغ (Nexium 40mg)"
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const arPart = match[1].trim();
    const enPart = match[2].trim();
    if (lang === 'en') {
      return { main: enPart, sub: null };
    } else {
      return { main: arPart, sub: `(${enPart})` };
    }
  }
  return { main: name, sub: null };
}

/**
 * Format Medicine Form
 */
export function formatMedicineForm(form = '', lang = 'ar') {
  if (lang === 'ar') return form;
  return MED_FORMS[form] || form;
}

/**
 * Format Dosage
 */
export function formatDosage(dosage = '', lang = 'ar') {
  if (lang === 'ar') return dosage;
  return DOSAGE_TRANSLATIONS[dosage] || dosage;
}

/**
 * Format Duration
 */
export function formatDuration(duration = '', lang = 'ar') {
  if (lang === 'ar') return duration;
  return DURATION_TRANSLATIONS[duration] || duration;
}

/**
 * Format Doctor Instructions
 */
export function formatInstructions(instructions = '', lang = 'ar') {
  if (lang === 'ar') return instructions;
  return INSTRUCTION_TRANSLATIONS[instructions] || instructions;
}

/**
 * Format Follow-up Date/Note
 */
export function formatFollowUp(followUp = '', lang = 'ar') {
  if (lang === 'ar') return followUp;
  return FOLLOWUP_TRANSLATIONS[followUp] || followUp;
}
