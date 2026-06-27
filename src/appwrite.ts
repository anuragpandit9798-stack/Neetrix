/// <reference types="vite/client" />
import { Client, Account, Databases, ID, Query } from 'appwrite';

// Retrieve values from environment variables or local storage for in-app configuration overrides
const getStoredConfig = () => {
  const customEndpoint = localStorage.getItem('appwrite_custom_endpoint');
  const customProject = localStorage.getItem('appwrite_custom_project_id');
  const customDb = localStorage.getItem('appwrite_custom_database_id');
  const customColl = localStorage.getItem('appwrite_custom_collection_id');

  return {
    endpoint: customEndpoint || import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1',
    projectId: customProject || import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a3f9f56000c2f5e57df',
    databaseId: customDb || import.meta.env.VITE_APPWRITE_DATABASE_ID || 'neet_tracker',
    collectionId: customColl || import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'daily_logs',
  };
};

export const currentConfig = getStoredConfig();

export const client = new Client();
client
  .setEndpoint(currentConfig.endpoint)
  .setProject(currentConfig.projectId);

// Automatically add a ping method to verify connectivity as per the setup guide
if (!(client as any).ping) {
  (client as any).ping = async function () {
    try {
      const res = await fetch(currentConfig.endpoint);
      console.log('Appwrite Ping verification status:', res.status);
      return res;
    } catch (err) {
      console.error('Appwrite Ping verification failed:', err);
      throw err;
    }
  };
}

export const account = new Account(client);
export const databases = new Databases(client);

// Wrapper to dynamically update Appwrite credentials in-app
export function updateAppwriteConfig(endpoint: string, projectId: string, databaseId: string, collectionId: string) {
  localStorage.setItem('appwrite_custom_endpoint', endpoint.trim());
  localStorage.setItem('appwrite_custom_project_id', projectId.trim());
  localStorage.setItem('appwrite_custom_database_id', databaseId.trim());
  localStorage.setItem('appwrite_custom_collection_id', collectionId.trim());

  // Reload page to apply new client configuration safely
  window.location.reload();
}

// Wrapper for createEmailSession / createEmailPasswordSession supporting both SDK v13 and v14+
export async function createSession(email: string, password: string) {
  const acc = account as any;
  if (typeof acc.createEmailPasswordSession === 'function') {
    return await acc.createEmailPasswordSession(email, password);
  } else if (typeof acc.createEmailSession === 'function') {
    return await acc.createEmailSession(email, password);
  } else {
    // Newer Appwrite SDK could use createSession, let's fallback to standard or throw descriptive error
    throw new Error('Unsupported Appwrite SDK authentication method. Check console.');
  }
}

export { ID, Query };
