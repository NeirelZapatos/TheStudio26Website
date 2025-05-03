// selectShippingRate.ts
import { Rate, ShipmentResponse } from './createShipment';

export function selectShippingRate(shipmentResponse: ShipmentResponse): Rate {
    // Filter USPS rates
    const uspsRates = shipmentResponse.rates.filter(rate => rate.provider === 'USPS');
    
    // Filter USPS Ground Advantage rates
    const groundAdvantageRates = uspsRates.filter(rate => 
        rate.servicelevel && rate.servicelevel.token === 'usps_ground_advantage'
    );

    // Sort rates by price (ascending)
    if (groundAdvantageRates.length > 0) {
        groundAdvantageRates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    }

    if (uspsRates.length > 0) {
        uspsRates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    }

    // Select the best rate according to our priority
    let selectedRate: Rate;
    if (groundAdvantageRates.length > 0) {
        selectedRate = groundAdvantageRates[0];
        console.log('Selected USPS Ground Advantage rate');
    } else if (uspsRates.length > 0) {
        selectedRate = uspsRates[0];
        console.log('Ground Advantage not available, using cheapest USPS rate');
    } else {
        // Fallback to cheapest rate from any provider
        shipmentResponse.rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        selectedRate = shipmentResponse.rates[0];
        console.log('No USPS rates available, using cheapest available rate');
    }

    console.log('Selected rate:', JSON.stringify(selectedRate, null, 2));
    return selectedRate;
}