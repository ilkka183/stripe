import axios from 'axios';

export default class StripeClient {
  constructor(host) {
    this.host = host;

    this.error = null;
    this.processing = false;
  }

  async createPayment(customerId, amount, currency, captureMethod = 'automatic') {
    this.beginWait();

    const data = {
      customerId,
      amount,
      currency,
      capture_method: captureMethod
    }

    const response = await axios.post(this.host + '/payment/create-by-first-customer-method/' + customerId, data);
    console.log(response.data.payment_intent);
    const paymentId = response.data.payment_intent.id;
    
    this.endWait();

    return paymentId;
  }

  async capturePayment(paymentId) {
    this.beginWait();

    const response = await axios.post(this.host + '/payment/capture/' + paymentId);
    console.log(response.data.payment_intent);

    this.endWait();
  }

  async cancelPayment(paymentId) {
    this.beginWait();

    const response = await axios.post(this.host + '/payment/cancel/' + paymentId);
    console.log(response.data.payment_intent);

    this.endWait();
  }

  beginWait() {
    this.processing = true;
    this.success = '';
    this.error = '';
  }

  endWait() {
    this.success = 'Succeeded';
    this.processing = false;
  }
}
