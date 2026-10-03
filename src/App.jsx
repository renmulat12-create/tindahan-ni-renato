import React, { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('marites_products');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Sardinas', price: 25, stock: 10 },
      { id: 2, name: 'Noodles', price: 15, stock: 15 },
      { id: 3, name: 'Kape (3-in-1)', price: 10, stock: 20 }
    ];
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('marites_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('marites_debts');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Aling Nena', amount: 150, date: 'Kahapon' },
      { id: 2, name: 'Mang Jose', amount: 85, date: 'Kani-kanina' }
    ];
  });

  const [cart, setCart] = useState([]);
  const [debtorName, setDebtorName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [payAmounts, setPayAmounts] = useState({});

  useEffect(() => {
    localStorage.setItem('marites_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('marites_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('marites_debts', JSON.stringify(debts));
  }, [debts]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Hala, ubos na ang stock ng ' + product.name + '!');
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });
    setProducts(updatedProducts);

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const newSale = {
      id: Date.now(),
      items: cart.map(item => `${item.name} (${item.qty}x)`).join(', '),
      total: totalAmount,
      date: new Date().toLocaleTimeString()
    };
    setSales([...sales, newSale]);
    setCart([]);
    alert('Salamat sa pagbili! Transaksyon na-record na.');
  };

  const handleResetBenta = () => {
    const confirmReset = window.confirm('Renato, sigurado ka ba na buburahin ang lahat ng record ng benta ngayon? (Ligtas ang iyong mga produkto at listahan ng utang!)');
    if (confirmReset) {
      setSales([]); 
      localStorage.removeItem('marites_sales'); 
      alert('Matagumpay na na-reset ang iyong benta ngayong araw!');
    }
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!debtorName || !debtAmount) return;
    
    const inputAmount = parseFloat(debtAmount);
    const cleanedName = debtorName.trim();

    const existingDebtIndex = debts.findIndex(
      d => d.name.toLowerCase() === cleanedName.toLowerCase()
    );

    if (existingDebtIndex !== -1) {
      const updatedDebts = [...debts];
      updatedDebts[existingDebtIndex].amount += inputAmount;
      updatedDebts[existingDebtIndex].date = new Date().toLocaleDateString();
      setDebts(updatedDebts);
      alert(`Nadagdag ang ₱${inputAmount} sa utang ni ${updatedDebts[existingDebtIndex].name}!`);
    } else {
      const newDebt = {
        id: Date.now(),
        name: cleanedName,
        amount: inputAmount,
        date: new Date().toLocaleDateString()
      };
      setDebts([...debts, newDebt]);
      alert(`Bagong pautang kay ${cleanedName} na-record na!`);
    }

    setDebtorName('');
    setDebtAmount('');
  };

  const handlePayDebt = (id, currentAmount, debtorName) => {
    const amountToPay = parseFloat(payAmounts[id]);
    if (!amountToPay || amountToPay <= 0) {
      alert('Mangyaring maglagay ng tamang halaga ng ibabayad.');
      return;
    }

    if (amountToPay >= currentAmount) {
      setDebts(debts.filter(d => d.id !== id));
      alert(`Salamat! Fully paid na si ${debtorName}.`);
    } else {
      setDebts(debts.map(d => d.id === id ? { ...d, amount: d.amount - amountToPay, date: new Date().toLocaleDateString() } : d));
      alert(`Nabasawasan ng ₱${amountToPay} ang utang ni ${debtorName}. Natitirang utang: ₱${currentAmount - amountToPay}`);
    }

    setPayAmounts({ ...payAmounts, [id]: '' });
  };

  const handleInputChange = (id, value) => {
    setPayAmounts({ ...payAmounts, [id]: value });
  };

  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', color: '#333' }}>
      <header style={{ backgroundColor: '#0070f3', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <h1>🏪 AI Marites - Sari-Sari Store POS</h1>
        <p>Kumusta, Boss Renato! Kontrolado natin ang iyong tindahan, benta, at listahan ng utang.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>📦 Mga Paninda / Imbentaryo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {products.map(p => (
              <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', backgroundColor: '#fff' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{p.name}</h3>
                <p style={{ margin: '0 0 5px 0' }}>Presyo: ₱{p.price}</p>
                <p style={{ margin: '0 0 10px 0', color: p.stock <= 3 ? 'red' : 'green', fontWeight: 'bold' }}>Stock: {p.stock} pcs</p>
                <button onClick={() => addToCart(p)} disabled={p.stock <= 0} style={{ padding: '5px 10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', width: '100%' }}>
                  {p.stock > 0 ? 'Idagdag' : 'Ubos Na'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px', backgroundColor: '#fff' }}>
            <h2>📝 Listahan ng mga Utang</h2>
            <h3 style={{ color: '#ef4444' }}>Kabuuang Pautang: ₱{totalDebtAmount}</h3>
            
            <form onSubmit={handleAddDebt} style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <input type="text" placeholder="Pangalan ng Utangero" value={debtorName} onChange={(e) => setDebtorName(e.target.value)} style={{ padding: '5px', flex: 2 }} />
              <input type="number" placeholder="Magkano" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} style={{ padding: '5px', flex: 1 }} />
              <button type="submit" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>+ Ilista</button>
            </form>

            <div>
              {debts.length === 0 ? <p>Swerte! Walang may utang ngayon.</p> : (
                debts.map(d => (
                  <div key={d.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>👤 <strong>{d.name}</strong> - <strong style={{ color: '#ef4444' }}>₱{d.amount}</strong> <small style={{ color: '#888' }}>({d.date})</small></span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <input type="number" placeholder="Magkano ibabayad?" value={payAmounts[d.id] || ''} onChange={(e) => handleInputChange(d.id, e.target.value)} style={{ padding: '3px', width: '130px', fontSize: '12px' }} />
                      <button onClick={() => handlePayDebt(d.id, d.amount, d.name)} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Tanggapin Bayad</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <h2>🛒 Basket ng Mamimili</h2>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', backgroundColor: '#fff', minHeight: '120px' }}>
            {cart.length === 0 ? <p style={{ color: '#888' }}>Walang laman ang basket.</p> : (
              <div>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{item.name} ({item.qty}x)</span>
                    <span>₱{item.price * item.qty}</span>
                  </div>
                ))}
                <hr />
                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                  <strong>Kabuuan: ₱{cart.reduce((sum, item) => sum + (item.price * item.qty), 0)}</strong>
                </div>
                <button onClick={checkout} style={{ width: '100%', padding: '10px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>I-benta Na! (Checkout)</button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <h2>📊 Ulat ng Benta Ngayong Araw</h2>
