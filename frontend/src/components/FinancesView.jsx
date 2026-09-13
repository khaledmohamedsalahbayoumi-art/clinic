import React, { useState } from 'react';

export default function FinancesView({
  transactions,
  branches,
  selectedBranch,
  currentRole,
  onAddTransaction
}) {
  const [filterType, setFilterType] = useState('all');
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    branchId: selectedBranch === 'all' ? (branches[0]?.id || 'br_maadi') : selectedBranch,
    category: 'مستلزمات طبية ومعقمات',
    amount: '',
    description: ''
  });

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (selectedBranch !== 'all' && t.branchId !== selectedBranch) return false;
    return true;
  });

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert('يرجى كتابة مبلغ صحيح');
      return;
    }

    onAddTransaction({
      ...expenseForm,
      type: 'expense',
      amount: Number(expenseForm.amount)
    });

    setIsNewExpenseOpen(false);
    setExpenseForm({
      branchId: selectedBranch === 'all' ? (branches[0]?.id || 'br_maadi') : selectedBranch,
      category: 'مستلزمات طبية ومعقمات',
      amount: '',
      description: ''
    });
  };

  // Export to Excel / CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = ['رقم السند', 'التاريخ', 'النوع', 'التصنيف', 'المريض أو البيان', 'المبلغ (ج.م)', 'الفرع', 'المسؤول'];
    const rows = filtered.map(t => [
      t.id,
      t.date,
      t.type === 'income' ? 'إيراد / قبض' : 'مصروف / صرف',
      `"${t.category || ''}"`,
      `"${t.patientName !== '-' ? t.patientName : (t.description || '')}"`,
      t.amount,
      `"${branches.find(b => b.id === t.branchId)?.name || 'الفرع الرئيسي'}"`,
      `"${t.recordedBy || 'المحاسب'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كشف_حسابات_المركز_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>💰 الإدارة المالية والخزينة والمصروفات</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            متابعة سندات القبض، إيرادات الكشوفات، وتسجيل المصروفات التشغيلية وصافي الأرباح.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="btn-export-csv"
            className="btn btn-outline"
            onClick={handleExportCSV}
            style={{ fontWeight: 600 }}
          >
            📥 تصدير كشف الحساب (Excel / CSV)
          </button>

          <button
            id="btn-add-expense"
            className="btn btn-primary"
            onClick={() => setIsNewExpenseOpen(true)}
          >
            ➕ تسجيل مصروف جديد
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          borderRight: '4px solid var(--emerald-500)'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>إجمالي الإيرادات</span>
          <div className="num-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-600)', margin: '4px 0' }}>
            +{totalIncome.toLocaleString()} ج.م
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>متحصلات الكشوفات والخدمات</span>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          borderRight: '4px solid var(--rose-500)'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>إجمالي المصروفات</span>
          <div className="num-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--rose-600)', margin: '4px 0' }}>
            -{totalExpense.toLocaleString()} ج.م
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تشغيل، صيانة، مستلزمات</span>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          borderRight: '4px solid var(--primary-500)'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>صافي الأرباح</span>
          <div className="num-display" style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: netProfit >= 0 ? 'var(--primary-700)' : 'var(--rose-600)',
            margin: '4px 0'
          }}>
            {netProfit.toLocaleString()} ج.م
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الفترة الحالية</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: '#ffffff',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)'
      }}>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'income', label: '💵 الإيرادات فقط' },
          { key: 'expense', label: '🧾 المصروفات فقط' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn btn-sm ${filterType === tab.key ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setFilterType(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <th style={{ padding: '14px 18px' }}>التاريخ</th>
                <th style={{ padding: '14px 18px' }}>النوع</th>
                <th style={{ padding: '14px 18px' }}>التصنيف والبيان</th>
                <th style={{ padding: '14px 18px' }}>المبلغ</th>
                <th style={{ padding: '14px 18px' }}>الفرع</th>
                <th style={{ padding: '14px 18px' }}>المستلم / المسؤول</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    لا توجد حركات مالية مسجلة لهذه الفئة.
                  </td>
                </tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 18px', fontSize: '0.88rem' }}>
                      <span className="num-display">{tx.date}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {tx.type === 'income' ? (
                        <span className="badge badge-emerald">قبض / إيراد</span>
                      ) : (
                        <span className="badge badge-rose">صرف / مصروف</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ fontSize: '0.92rem', display: 'block' }}>{tx.category}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {tx.patientName && tx.patientName !== '-' ? `المريض: ${tx.patientName}` : (tx.description || '-')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <strong className="num-display" style={{
                        fontSize: '1.05rem',
                        color: tx.type === 'income' ? 'var(--emerald-600)' : 'var(--rose-600)'
                      }}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount?.toLocaleString()} ج.م
                      </strong>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.88rem' }}>
                      {branches.find(b => b.id === tx.branchId)?.name || 'الفرع الرئيسي'}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {tx.recordedBy || 'المحاسب'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isNewExpenseOpen && (
        <div className="modal-overlay" onClick={() => setIsNewExpenseOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>➕ تسجيل سند صرف ومصروف جديد</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setIsNewExpenseOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">الفرع *</label>
                  <select
                    className="form-control"
                    value={expenseForm.branchId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, branchId: e.target.value })}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">بند المصروف *</label>
                  <select
                    className="form-control"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    <option value="مستلزمات طبية ومعقمات">مستلزمات طبية ومعقمات</option>
                    <option value="صيانة أجهزة وتكييفات">صيانة أجهزة وتكييفات</option>
                    <option value="إيجار مقر الفرع">إيجار مقر الفرع</option>
                    <option value="فواتير كهرباء ومياه وإنترنت">فواتير كهرباء ومياه وإنترنت</option>
                    <option value="بوفيه وضيافة ونظافة">بوفيه وضيافة ونظافة</option>
                    <option value="رواتب ومكافآت طاقم العمل">رواتب ومكافآت طاقم العمل</option>
                    <option value="مصاريف نثرية أخرى">مصاريف نثرية أخرى</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">المبلغ بالجنيه *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="مثال: 500"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">البيان والتفاصيل</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="تفاصيل إضافية للسند..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  تسجيل المصروف في الخزينة
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setIsNewExpenseOpen(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
