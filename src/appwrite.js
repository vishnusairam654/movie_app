import { Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

if (!PROJECT_ID || !DATABASE_ID || !COLLECTION_ID || !ENDPOINT) {
    throw new Error("Missing Appwrite environment variables. Make sure VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_COLLECTION_ID, and VITE_APPWRITE_ENDPOINT are set in your .env file.");
}

const client = new Client()
    .setEndpoint(ENDPOINT) // Use endpoint from env
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        console.log('🔍 Searching for:', searchTerm);
        console.log('🎬 Movie data:', movie);

        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ])

        console.log('📊 Search result:', result);

        if(result.documents.length > 0) {
            const doc = result.documents[0];
            console.log('✏️ Updating existing document:', doc.$id);

            const updated = await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            })

            console.log('✅ Document updated:', updated);
        } else {
            console.log('➕ Creating new document');

            const newDoc = await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm: searchTerm,
                    count: 1,
                    movie_id: movie.id, // Save as integer, not string
                    title: movie.title,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }
            )

            console.log('✅ Document created:', newDoc);
        }
    } catch (error) {
        console.error('❌ Error in updateSearchCount:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            type: error.type,
            response: error.response
        });
        throw error;
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])

        return result.documents;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return []; // Return empty array on error
    }
}