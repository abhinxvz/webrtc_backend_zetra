export default function Profile() {
  return (
    <>
      <style>{`
        @font-face {
          font-family: 'GaramondCustom';
          src: url('https://aruyghvpjdiiuiesaupw.supabase.co/storage/v1/object/public/pin-fonts/Garamond%20BE%20Condensed.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'GaramondCustom';
          src: url('https://aruyghvpjdiiuiesaupw.supabase.co/storage/v1/object/public/pin-fonts/Garamond%20BE%20Condensed-Italic.otf') format('opentype');
          font-weight: 400;
          font-style: italic;
        }
        .garamond-font { 
          font-family: 'GaramondCustom', serif; 
        }
        .garamond-italic { 
          font-family: 'GaramondCustom', serif; 
          font-style: italic; 
        }
      `}</style>
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://aruyghvpjdiiuiesaupw.supabase.co/storage/v1/object/public/pins-assets/unnamed%20--.png')" }}
      >
        {/* Top-left Logo */}
        <div className="absolute top-4 left-4">LOGO</div>

        {/* Center Content */}
        <div className="text-center px-4 w-[60%]">
          <h1 className="garamond-font text-6xl font-normal text-white drop-shadow-lg text-zinc-900">
            Find Your Inner Peace, <span className="garamond-italic">One Breath at a Time!</span>
          </h1>
          <button className="mt-8 px-6 py-3 bg-[#193d21] text-white font-normal rounded-2xl hover:bg-[#193d21]/90 transition duration-300 font-inter">
            Download App
          </button>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-4 flex flex-col items-center space-y-2">
          <p className="font-inter text-white text-xs text-center">
            Reconnect with nature and find inner calm.
          </p>
          <div className="flex space-x-2">
            <img src="https://w7.pngwing.com/pngs/275/961/png-transparent-chanel-logo-brand-gucci-logo-text-trademark-fashion.png" alt="Logo 1" className="w-6 h-6" />
            <img src="https://w7.pngwing.com/pngs/275/961/png-transparent-chanel-logo-brand-gucci-logo-text-trademark-fashion.png" alt="Logo 2" className="w-6 h-6" />
            <img src="https://w7.pngwing.com/pngs/275/961/png-transparent-chanel-logo-brand-gucci-logo-text-trademark-fashion.png" alt="Logo 3" className="w-6 h-6" />
            <img src="https://w7.pngwing.com/pngs/275/961/png-transparent-chanel-logo-brand-gucci-logo-text-trademark-fashion.png" alt="Logo 4" className="w-6 h-6" />
            <img src="https://w7.pngwing.com/pngs/275/961/png-transparent-chanel-logo-brand-gucci-logo-text-trademark-fashion.png" alt="Logo 5" className="w-6 h-6" />
          </div>
        </div>
      </div>
    </>
  );
}