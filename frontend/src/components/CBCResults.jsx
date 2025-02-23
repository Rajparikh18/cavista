import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const CBCResults = ({ analysisData }) => {
  if (!analysisData?.CBC_Analysis) {
    return null;
  }

  const getSeverityColor = (rating) => {
    switch (rating) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (severity) => {
    if (severity <= 1) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (severity <= 3) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const { parameters = {}, final_assessment = '', overall_urgency_rating = 0, general_recommendations = {} } = analysisData.CBC_Analysis;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      {/* Overall Assessment Section */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">CBC Analysis Results</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(overall_urgency_rating)}`}>
            Urgency Level: {overall_urgency_rating}
          </span>
        </div>
        <p className="mt-2 text-lg font-medium text-gray-700">Final Assessment: {final_assessment}</p>
      </div>

      {/* General Recommendations */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">General Recommendations</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-800">Dietary:</span>
            <span className="text-blue-700">{general_recommendations.dietary || 'No specific recommendations'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-800">Lifestyle:</span>
            <span className="text-blue-700">{general_recommendations.lifestyle || 'No specific recommendations'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-800">Medical Guidance:</span>
            <span className="text-blue-700">{general_recommendations.medical_guidance || 'No specific recommendations'}</span>
          </div>
        </div>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(parameters).map(([name, data]) => {
          const {
            value = '',
            unit = '',
            status = '',
            severity_rating = 1,
            possible_conditions = [],
            recommendations = {}
          } = data || {};

          return (
            <div key={name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                {getStatusIcon(severity_rating)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">{value} {unit}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded ${getSeverityColor(severity_rating)}`}>
                    {status}
                  </span>
                </div>

                {possible_conditions && possible_conditions.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-600">Possible Conditions:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {possible_conditions.map((condition, idx) => (
                        <span key={`${condition}-${idx}`} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations && (
                  <div className="mt-2 space-y-1 text-sm">
                    {recommendations.dietary_changes && (
                      <p className="text-gray-600">
                        <span className="font-medium">Diet:</span> {recommendations.dietary_changes}
                      </p>
                    )}
                    {recommendations.lifestyle_changes && (
                      <p className="text-gray-600">
                        <span className="font-medium">Lifestyle:</span> {recommendations.lifestyle_changes}
                      </p>
                    )}
                    {recommendations.medical_attention && (
                      <p className="text-gray-600">
                        <span className="font-medium">Medical:</span> {recommendations.medical_attention}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CBCResults;