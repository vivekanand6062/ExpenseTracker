import { Link } from 'react-router-dom';

const BrandLogo = ({
  size = 'md',
  variant = 'compact',
  showTagline = false,
  linkTo = '/',
  className = '',
  textColor = 'text-slate-900',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
    xl: 'w-14 h-14 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* 3D Geometric Bridge Logo Mark */}
      <div
        className={`${iconSizes[size] || iconSizes.md} shrink-0 overflow-hidden shadow-xs border border-teal-500/20 bg-emerald-950/10 flex items-center justify-center`}
      >
        <img
          src="/logo.png"
          alt="ArthSetu AI"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to favicon SVG if image load fails
            e.target.src = '/favicon.svg';
          }}
        />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${textSizes[size] || textSizes.md} ${textColor}`}
              style={{ letterSpacing: '-0.03em' }}
            >
              ArthSetu
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 font-extrabold text-[10px] tracking-wider border border-teal-500/25 uppercase">
              AI
            </span>
          </div>
          {showTagline && (
            <span className="text-[11px] font-medium text-slate-500 mt-0.5 tracking-normal">
              Understand your money. Build your future.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block hover:opacity-95 transition">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default BrandLogo;
