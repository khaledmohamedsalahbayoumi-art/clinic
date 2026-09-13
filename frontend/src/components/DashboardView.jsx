import React from 'react';

export default function DashboardView({
  stats,
  branches,
  selectedBranch,
  setSelectedBranch,
  onNavigateTab,
  onNewBooking,
  onNewPatient,
  onNewExpense
}) {
  if (!stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>جاري تحميل المؤشرات والإحصائيات...</p>
      </div>
    );
  }

  const currentBranchName = selectedBranch === 'all'
    ? 'جميع الفروع مجمعة'
    : (branches.find(b => b.id === selectedBranch)?.name || 'الفرع المحدد');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome with Active Branch summary */}
      <div style={{
        background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #0d9488 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              مرحباً بك في لوحة تحكم المركز الطبي
            </h2>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              📍 {currentBranchName}
            </span>
          </div>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '600px' }}>
            نظرة عامة حية على نشاط العيادات اليوم، حركة طابور الانتظار، وأداء الأطباء والمؤشرات المالية.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="btn-quick-new-booking"
            className="btn"
            style={{ backgroundColor: '#ffffff', color: 'var(--primary-700)', fontWeight: 700 }}
            onClick={onNewBooking}
          >
            ➕ تسجيل كشف جديد
          </button>
          <button
            id="btn-quick-new-patient"
            className="btn"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 600 }}
            onClick={onNewPatient}
          >
            👤 إضافة ملف مريض
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px'
      }}>
        {/* Card 1: Today's Revenue */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--emerald-50)',
            color: 'var(--emerald-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.7rem'
          }}>
            💵
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>إيرادات اليوم</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="num-display" style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
                {stats.todayRevenue.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>جنيه</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
              صافي: {(stats.netProfit || 0).toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Card 2: Waiting Queue */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer'
          }}
          onClick={() => onNavigateTab('queue')}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--amber-50)',
            color: 'var(--amber-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.7rem'
          }}>
            ⏳
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>مرضى في الانتظار</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="num-display" style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
                {stats.waitingCount}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>مريض</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--amber-600)', fontWeight: 600 }}>
              في صالة الانتظار حالياً
            </span>
          </div>
        </div>

        {/* Card 3: Active Doctors */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-50)',
            color: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.7rem'
          }}>
            🩺
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>أطباء في الخدمة</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="num-display" style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
                {stats.activeDoctorsCount}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>طبيب</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              عيادات مفتوحة وجاهزة
            </span>
          </div>
        </div>

        {/* Card 4: Total Visits Today */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--purple-50)',
            color: 'var(--purple-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.7rem'
          }}>
            ✅
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>كشوفات منجزة</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="num-display" style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
                {stats.completedCount}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>من {stats.totalTodayAppointments}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--purple-500)', fontWeight: 600 }}>
              إجمالي حجوزات اليوم
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Multi-branch comparison + Doctor Performance */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px'
      }}>
        {/* Multi-Branch Performance Breakdown */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>🏢 مقارنة أداء الفروع</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>مقارنة الإيرادات والمصروفات وعدد المراجعين</p>
            </div>
            <span className="badge badge-primary">{branches.length} فروع مفعلة</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.branchBreakdown && stats.branchBreakdown.map(branch => {
              const maxRev = Math.max(...stats.branchBreakdown.map(b => b.revenue), 1000);
              const percentage = Math.round((branch.revenue / maxRev) * 100);

              return (
                <div key={branch.id} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>📍</span>
                      <strong style={{ fontSize: '0.98rem' }}>{branch.name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {branch.patientCount} مراجع
                      </span>
                      <strong className="num-display" style={{ color: 'var(--primary-700)', fontSize: '1.05rem' }}>
                        {branch.revenue.toLocaleString()} ج.م
                      </strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: `${Math.max(percentage, 8)}%`,
                      height: '100%',
                      background: 'var(--primary-gradient)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out'
                    }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>المصروفات: {branch.expenses.toLocaleString()} ج.م</span>
                    <span style={{ color: branch.profit >= 0 ? 'var(--emerald-600)' : 'var(--rose-600)', fontWeight: 600 }}>
                      الصافي: {branch.profit.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Performance */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>👨‍⚕️ كفاءة وأداء الأطباء</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>عدد الكشوفات والإيرادات وتقييم المرضى</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateTab('queue')}
            >
              عرض الطابور
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.doctorPerformance && stats.doctorPerformance.map(doc => (
              <div key={doc.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    {doc.avatar || '👨‍⚕️'}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{doc.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {doc.clinic} • ⭐ {doc.rating}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div className="num-display" style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.98rem' }}>
                    {doc.revenue.toLocaleString()} ج.م
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {doc.totalVisits} زيارة
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
