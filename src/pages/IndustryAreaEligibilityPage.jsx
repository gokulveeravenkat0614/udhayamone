import React from 'react';
import { IndustryAreaEligibility } from '../components/IndustryAreaEligibility';
import { AlertCircle, RefreshCw } from 'lucide-react';

class IndustryAreaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[IndustryAreaEligibilityPage] Runtime error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto py-24 px-6 text-center">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-soft p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Unable to load Industry Areas.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              An unexpected display error occurred. Please click retry to reload the industry area view.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-5 py-2.5 rounded-xl bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const IndustryAreaEligibilityPage = ({
  onNavigate,
  selectedState = 'Maharashtra',
  selectedDistrict = 'All',
  selectedIndustry = ''
}) => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <IndustryAreaErrorBoundary>
        <IndustryAreaEligibility
          initialState={selectedState}
          initialDistrict={selectedDistrict}
          onNavigate={onNavigate}
        />
      </IndustryAreaErrorBoundary>
    </div>
  );
};
