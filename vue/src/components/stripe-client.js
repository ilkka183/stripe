import axios from 'axios';

export default class StripeClient {
  constructor(host) {
    this.host = host;

    // Payment method
    this.customerId = null;
    this.paymentMethodId = null;
    this.name = null;
    this.email = null;
    this.phone = null;

    // Payment
    this.paymentId = null;
    this.captureNeeded = false;

    this.error = null;
    this.processing = false;
  }

  createPayment(amount, currency, captureMethod = 'automatic') {
    this.beginWait();

    const data = {
      customerId: this.customerId,
      amount,
      currency,
      capture_method: captureMethod
    }

    axios.post(this.host + '/payment/create-by-first-customer-method/' + this.customerId, data)
      .then(response => {
        console.log(response.data.payment_intent);
        this.paymentId = response.data.payment_intent.id;
        this.captureNeeded = captureMethod == 'manual';

        this.endWait();
      })
      .catch(error => this.paymentError(error));
  }

  capturePayment() {
    if (!this.paymentId)
      throw new Error('Payment has not been created');

    this.beginWait();

    axios.post(this.host + '/payment/capture/' + this.paymentId)
      .then(response => {
        console.log(response.data.payment_intent);
        this.captureNeeded = false;

        this.endWait();
      })
      .catch(error => this.paymentError(error));
  }

  cancelPayment() {
    if (!this.paymentId)
      throw new Error('Payment has not been created');

    this.beginWait();

    axios.post(this.host + '/payment/cancel/' + this.paymentId)
      .then(response => {
        console.log(response.data.payment_intent);
        this.captureNeeded = false;

        this.endWait();
      })
      .catch(error => this.paymentError(error));
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

  paymentError(error) {
    console.log(error.response);
    this.error = error.response.data.message;
    this.processing = false;
  }
}
