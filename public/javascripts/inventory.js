const selects = document.querySelectorAll('.item-select');
const inventoryList = document.querySelector('.inventory-list');
const addBtns = document.querySelectorAll('.btn-add');
const qtyInputs = document.querySelectorAll('.item-qty');

const selectItem = (e) => {
  const [price, stock] = e.target.value.split('-');
  const priceElement = e.target.nextElementSibling;
  const qtyElement = priceElement.nextElementSibling;
  priceElement.textContent = `$${price}`;
  if (0 === parseInt(price)) {
    qtyElement.value = 0;
  } else qtyElement.value = 1;

  qtyElement.max = stock;

  calculateTotal();
};

selects.forEach((select) => select.addEventListener('change', selectItem));

const removeRow = (e) => {
  inventoryList.removeChild(e.target.parentElement);
  calculateTotal();
};

const calculateTotal = () => {
  const productRows = [...inventoryList.querySelectorAll('.product-row')];
  const totalPrice = productRows.reduce((acc, row) => {
    const price = +row.querySelector('.item-price').textContent.substring(1);
    const qty = +row.querySelector('.item-qty').value;
    return (acc += price * qty);
  }, 0);
  document.querySelector('.total-price').textContent = `$${totalPrice}`;
};

const addRow = (e) => {
  const li = e.target.previousElementSibling;
  const liCopy = li.cloneNode(true);
  liCopy.querySelector('.item-price').textContent = '$0';
  const qtyInput = liCopy.querySelector('.item-qty');
  qtyInput.value = 0;
  qtyInput.max = 0;

  let removeBtn = liCopy.querySelector('.btn-remove');
  if (!removeBtn) {
    removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = '×';
    liCopy.appendChild(removeBtn);
  }
  removeBtn.addEventListener('click', removeRow, { once: true });

  li.insertAdjacentElement('afterend', liCopy);
  liCopy.querySelector('.item-select').addEventListener('change', selectItem);
  liCopy.querySelector('.item-qty').addEventListener('change', calculateTotal);
};

addBtns.forEach((btn) => btn.addEventListener('click', addRow));

qtyInputs.forEach((input) => input.addEventListener('change', calculateTotal));
