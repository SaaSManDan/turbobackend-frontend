export async function fetchUserPaymentStatus(){
    console.log("Fetching user payment status");
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/account/paymentStatus`);
        const data = await response.json();
        console.log("Payment status: " + data.paymentStatus);
        return data.paymentStatus;
    } catch (error) {
        console.error("Error fetching payment status:", error);
    }
}