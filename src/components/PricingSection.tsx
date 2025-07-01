'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PricingPlan } from '@/types'

export default function PricingSection() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])

  useEffect(() => {
    fetchPricingPlans()
  }, [])

  const fetchPricingPlans = async () => {
    const { data } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (data) setPricingPlans(data)
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'BEST':
        return 'bg-red-500 text-white'
      case 'HOT':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  const getPhoneIcon = (index: number) => {
    const colors = ['text-blue-500', 'text-green-500', 'text-purple-500']
    return colors[index % colors.length]
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            고객님의 니즈에 맞는 맞춤형 요금제
          </h2>
          <p className="text-lg text-gray-600">
            엔텔레콤 추천 요금제
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div key={plan.id} className="pricing-card relative">
              {/* 태그 */}
              {plan.tag && (
                <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-sm font-bold ${getTagColor(plan.tag)}`}>
                  {plan.tag}
                </div>
              )}

              {/* 요금제 이미지/아이콘 */}
              <div className="text-center mb-6">
                {plan.image_url ? (
                  <img 
                    src={plan.image_url} 
                    alt={plan.name}
                    className="w-24 h-24 mx-auto object-contain"
                  />
                ) : (
                  <div className={`text-6xl ${getPhoneIcon(index)}`}>
                    📱
                  </div>
                )}
              </div>

              {/* 요금제 정보 */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-red-500">
                    {plan.price}
                  </span>
                  {plan.original_price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {plan.original_price}
                    </span>
                  )}
                </div>

                {/* 특징 */}
                {plan.features && Array.isArray(plan.features) && (
                  <ul className="text-sm text-gray-600 space-y-1 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {/* 전화 아이콘과 번호 */}
                <div className="flex items-center justify-center text-orange-500 font-semibold">
                  <span className="text-xl mr-2">📞</span>
                  <span>010-1234-5678</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 