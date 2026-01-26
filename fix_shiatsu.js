
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixShiatsu() {
    console.log('Attempting to fix Shiatsu image...');

    // Using a distinct image: focused pressure points
    const newImageUrl = 'https://images.unsplash.com/photo-1611077544192-fa35438177e7?q=80&w=2070';

    const { data, error } = await supabase
        .from('services')
        .update({ image_url: newImageUrl })
        .eq('title', 'Shiatsu Massage')
        .select();

    if (error) {
        console.error('Error updating Shiatsu:', error.message);
    } else if (data && data.length > 0) {
        console.log('Successfully updated Shiatsu Massage image in DB:', data[0].image_url);
    } else {
        console.log('No rows updated. Trying to find the service first...');
        const { data: search } = await supabase.from('services').select('*').ilike('title', '%Shiatsu%');
        console.log('Search results:', JSON.stringify(search));
    }
}

fixShiatsu();
