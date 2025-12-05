export async function getPaymentLink(type){
    await fetch(process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/api/stripe/createPaymentLink?type=" + type)
        .then(response => response.json())
        .then((data) => {
            if(data["error"]){
                console.log("There was an error with fetching a payment link: " + data["error"]) 
                return;
            }

            linkOpener(data.stripeCheckoutUrl);
        });
}

function linkOpener(link){
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              
    if (!isMobile) {
        window.open(link, "_blank");
    } else {
        window.location.href = link;
    }
};