/**
 * Purpose: Loyalty Card reusable UI component. Main declarations: LoyaltyCard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Award, Star, Gift } from "lucide-react";

// Define LoyaltyCard; its parameters and body implement this operation.
export default function LoyaltyCard({ loyalty = {} }) {
  // Declare tier for use by the surrounding module or function.
  const tier = loyalty.tier || "Bronze";
  // Declare points for use by the surrounding module or function.
  const points = loyalty.points || 0;

  /*
  |--------------------------------------------------------------------------
  | NEXT TIER PROGRESS
  |--------------------------------------------------------------------------
  */

  // Declare tiers for use by the surrounding module or function.
  const tiers = {
    Bronze: 1000,
    Silver: 3000,
    Gold: 7000,
    Platinum: 12000,
  };

  // Declare nextTarget for use by the surrounding module or function.
  const nextTarget = tiers[tier] || 1000;

  // Declare progress for use by the surrounding module or function.
  const progress = Math.min(
    (points / nextTarget) * 100,
    100
  );

  // Return the expression shown below to the caller.
  return (
    <div
      className="
      relative
      overflow-hidden
      rounded-2xl
      bg-gradient-to-br
      from-green-700
      via-green-600
      to-emerald-500
      text-white
      shadow-xl
      p-8
      "
    >
      {/* Decorative circles */}

      <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />

      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative z-10">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <p className="uppercase tracking-widest text-sm text-green-100">
              Loyalty Program
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Hussein Rewards
            </h2>
          </div>

          <Award size={42} />
        </div>

        {/* Tier */}

        <div className="mt-8 flex items-center gap-3">
          <Star
            size={22}
            className="text-yellow-300"
          />

          <span className="text-lg">
            <strong>{tier}</strong> Member
          </span>
        </div>

        {/* Points */}

        <div className="mt-8">
          <p className="text-green-100 text-sm">
            Available Points
          </p>

          <h1 className="text-5xl font-extrabold mt-1">
            {points.toLocaleString()}
          </h1>
        </div>

        {/* Progress */}

        <div className="mt-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Next Tier Progress</span>

            <span>{Math.round(progress)}%</span>
          </div>

          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-sm text-green-100">
            {Math.max(nextTarget - points, 0).toLocaleString()} points to next
            reward level.
          </p>
        </div>

        {/* Footer */}

        <div className="mt-8 flex items-center gap-3 text-green-100">
          <Gift size={20} />

          <span>
            Earn points with every booking and redeem exclusive travel rewards.
          </span>
        </div>
      </div>
    </div>
  );
}
