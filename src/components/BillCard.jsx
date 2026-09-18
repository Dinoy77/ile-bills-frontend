export default function BillCard({ bill }) {
  const date = bill.created_at ? new Date(bill.created_at).toLocaleString() : ''

  return (
    <a href={bill.photo_url} target="_blank" rel="noreferrer" className="bill-card">
      <img src={bill.photo_url} alt={`Bill by ${bill.employee_name}`} />
      <div className="bill-info">
        <strong>{bill.employee_name}</strong>
        {bill.bill_amount && <span>Rs. {bill.bill_amount}</span>}
        <span className="bill-date">{date}</span>
      </div>
    </a>
  )
}
