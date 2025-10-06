import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

const CheckoutForm = ({
    clientSecret,
    cartItems,
    coupon,
    sessionId
}: {
    clientSecret: string;
    cartItems: any[];
    coupon: any;
    sessionId: string | null;
}) => {

  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'failed' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.sale_price, 0) - (coupon?.discountAmount || 0);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage(null);
    setStatus(null);

    if(!stripe || !elements) {
      setLoading(false);
      return;
    }

    const res = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
      }
    })

    if(res.error) {
      setErrorMessage(res.error.message || 'An unexpected error occurred.');
      setStatus('failed');
    } else {
      setStatus('success');
    } 

    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          Secure Payment Checkout 
        </h2>

        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-2">
          {cartItems.map((item, idx) => (
            <div className="flex justify-between text-sm pb-1" key={idx}>
              <span>
                {item.quantity} x {item.title}
              </span>
              <span>${(item.quantity * item.sale_price).toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between font-semibold pt-2 border-t">
            {coupon?.discountAmount !==0 && (
              <>
                <span>Discount</span>
                <span className="text-green-600">
                  ${(coupon.discountAmount).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <PaymentElement />
        <button type="submit"
          disabled={!stripe || loading}
          className='w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading && <Loader2 className='animate-spin w-5 h-5' />}
          {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className='w-5 h-5' />
            {errorMessage}
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
            <CheckCircle className='w-5 h-5' />
            Payment successful!
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className='w-5 h-5' />
            Payment failed. Please try again.
          </div>
        )}
      </form>
    </div>
  )
}

export default CheckoutForm