-- Add Signature Massages and Luxury Packages to Golden Tower Spa

-- First, let's add the signature massages
INSERT INTO public.services (title, description, duration, price, category, image_url)
VALUES 
  (
    'Golden Tower Signature',
    'Our exclusive signature massage combining traditional Hilot techniques with modern aromatherapy. This transformative treatment uses warm golden oils infused with ylang-ylang and sandalwood, designed to restore balance and awaken your inner radiance.',
    '90 min',
    2500,
    'signature',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070'
  );

-- Now add the luxury packages
INSERT INTO public.services (title, description, duration, price, category, image_url)
VALUES 
  (
    'Ultimate Escape Package',
    'Indulge in our most comprehensive wellness experience.\n\nIncludes:\n• 90-min Golden Tower Signature Massage\n• 60-min Aromatherapy Face & Scalp Treatment\n• 30-min Foot Reflexology\n• Complimentary herbal tea ceremony\n• Access to relaxation lounge',
    '3 hours',
    4500,
    'package',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070'
  ),
  (
    'Couples Harmony Package',
    'Share the journey of relaxation with your loved one.\n\nIncludes:\n• Dual 90-min Swedish or Hilot Massage\n• Private couples suite\n• Champagne and fresh fruit platter\n• Rose petal foot bath ceremony\n• Souvenir aromatic candle set',
    '2 hours',
    5500,
    'package',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070'
  ),
  (
    'Executive Wellness Package',
    'Perfect for busy professionals seeking quick rejuvenation.\n\nIncludes:\n• 60-min Deep Tissue Massage\n• 30-min Stress Relief Head Massage\n• Express chair massage\n• Energizing essential oil blend\n• Take-home wellness kit',
    '90 min',
    3200,
    'package',
    'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=2070'
  ),
  (
    'Rebirth Ritual Package',
    'A complete mind-body transformation experience.\n\nIncludes:\n• 120-min Traditional Hilot Healing\n• Full body scrub with organic ingredients\n• 45-min Aromatherapy session\n• Chakra balancing meditation\n• Herbal detox tea blend\n• Personalized wellness consultation',
    '4 hours',
    6800,
    'package',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070'
  );

-- Optional: Verify the inserted data
SELECT 
  title, 
  category, 
  price, 
  duration 
FROM 
  public.services 
WHERE 
  category IN ('signature', 'package')
ORDER BY 
  category, price;
