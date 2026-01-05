'use client';

import type { CartItem } from '../types';

interface CartItemsTableProps {
  items: CartItem[];
}

export default function CartItemsTable({ items }: CartItemsTableProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    const price =
      typeof item.price === 'number'
        ? item.price
        : parseFloat(item.price ?? '0');
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="cart-items-table">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio Unit.</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const price =
              typeof item.price === 'number'
                ? item.price
                : parseFloat(item.price ?? '0');
            const subtotal = price * item.quantity;

            return (
              <tr key={`${item._id}-${index}`}>
                <td>{item.name}</td>
                <td>${price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${subtotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td></td>
            <td>
              <strong>{totalQuantity}</strong>
            </td>
            <td>
              <strong>${totalAmount.toFixed(2)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
