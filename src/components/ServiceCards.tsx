'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ServiceCard } from '@/types'

const defaultIcons = [
  '🚚', '📞', '🛡️', '👤', '🚗', '📶'
]

export default function ServiceCards() {
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>([])

  useEffect(() => {
    fetchServiceCards()
  }, [])

  const fetchServiceCards = async () => {
    const { data } = await supabase
      .from('service_cards')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (data) setServiceCards(data)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {serviceCards.map((card, index) => (
            <div key={card.id} className="flex flex-col items-center">
              <div className="service-card w-20 h-20 flex items-center justify-center mb-4">
                {card.icon_url?.startsWith('http') ? (
                  <img 
                    src={card.icon_url} 
                    alt={card.title}
                    className="w-12 h-12 object-contain"
                  />
                ) : card.icon_url ? (
                  <span className="text-3xl">{card.icon_url}</span>
                ) : (
                  <span className="text-3xl">
                    {defaultIcons[index % defaultIcons.length]}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {card.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 