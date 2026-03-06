import React, { useState } from 'react';

const ROI: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50000);
  const airbnbFee = 0.15; // 15%
  const sanctumFee = 0.04; // 4%
  const stripeFee = 0.029; // 2.9%

  const yearlySavings = Math.round(sliderValue * (airbnbFee - (sanctumFee + stripeFee)));

  return (
    <div id="roi-calculator" className="bg-[#F9F7F4] py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="bg-[#333333] text-white rounded-3xl p-6 md:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Stop Burning Money</h2>
                    <p className="mt-4 text-lg text-white/80 max-w-lg">Major platforms like Airbnb can take 15% or more in commissions. With Sanctum, your cost is a transparent 4% fee plus a standard 2.9% Stripe processing fee. See how much you could save.</p>
                </div>
                <div className="bg-white/10 p-6 md:p-8 rounded-2xl">
                    <p className="text-white/90 text-lg">Your Annual Booking Revenue</p>
                    <p className="text-4xl sm:text-5xl font-bold text-white my-4">${sliderValue.toLocaleString()}</p>
                    <input 
                        type="range" 
                        min="2000" 
                        max="200000" 
                        step="1000"
                        value={sliderValue} 
                        onChange={(e) => setSliderValue(Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer thumb:bg-white"
                        style={{
                          background: `linear-gradient(to right, #047857 0%, #047857 ${((sliderValue - 2000) / 198000) * 100}%, rgba(255,255,255,0.2) ${((sliderValue - 2000) / 198000) * 100}%, rgba(255,255,255,0.2) 100%)`
                        }}
                    />
                    <div className="mt-8 text-center">
                        <p className="text-lg text-white/90">Your estimated annual savings:</p>
                        <p className="text-5xl md:text-6xl font-extrabold text-brand-green">~${yearlySavings.toLocaleString()}</p>
                        <p className="mt-2 text-white/70">Enough for a nice vacation.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ROI;
