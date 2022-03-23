const selects = document.querySelectorAll('.item-select');
const inventoryList = document.querySelector('.inventory-list');
const addBtns = document.querySelectorAll('.btn-add');
const qtyInputs = document.querySelectorAll('.item-qty');

const storeCookies = (category, item, row, price, qty) => {
  const cookies = document.cookie.split(';');
  const key = `${category}-${row}`;
  if (cookies.some((cookie) => cookie.trim().includes(key)) && !item) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    return;
  }

  if (item) {
    document.cookie = `${key}=${item}-${price}-${qty}`;
  }
};

const selectItem = (e) => {
  const [price, stock] = e.target.value.split('-');
  const priceElement = e.target.nextElementSibling;
  const qtyElement = priceElement.nextElementSibling;

  priceElement.textContent = `$${price}`;
  if (0 === parseFloat(price)) {
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
    const { rowindex } = row.dataset;
    const { category, item } =
      row.querySelector('.item-select').selectedOptions[0].dataset;
    const price = +row.querySelector('.item-price').textContent.substring(1);
    const qty = +row.querySelector('.item-qty').value;

    storeCookies(category, item, rowindex, price, qty);

    return (acc += price * qty);
  }, 0);
  document.querySelector('.total-price').textContent = `$${totalPrice}`;
};

const addRow = (e) => {
  const li = e.target.previousElementSibling;
  const liCopy = li.cloneNode(true);
  const qtyInput = liCopy.querySelector('.item-qty');

  liCopy.querySelector('.item-price').textContent = '$0';
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

  const itemSelect = liCopy.querySelector('.item-select');

  itemSelect.addEventListener('change', selectItem);
  qtyInput.addEventListener('change', calculateTotal);

  liCopy.dataset.rowindex = +li.dataset.rowindex + 1;
};

addBtns.forEach((btn) => btn.addEventListener('click', addRow));

qtyInputs.forEach((input) => input.addEventListener('change', calculateTotal));
