'use client';
import mammoth from 'mammoth';
import { useState, useEffect } from 'react';

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [articles, setArticles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [websites, setWebsites] = useState([]);

  const getFilteredWebsites = () => {
    return websites.filter(website => {
      const matchesSearch = website.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesTag = !selectedTag || website.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  };

  useEffect(() => {
    const filtered = getFilteredWebsites();
    
    if (filtered.length === 1) {
      // אם נמצא אתר אחד בלבד - נבחר אותו
      setSelectedWebsite(filtered[0].id.toString());
    } else {
      // אם אין תוצאות או יש יותר מאחת - נאפס את הבחירה
      setSelectedWebsite('');
    }
  }, [searchText, selectedTag, websites]);

useEffect(() => {
    // טעינת האתרים בעת טעינת הדף
    const savedWebsites = localStorage.getItem('websites');
    if (savedWebsites) {
        setWebsites(JSON.parse(savedWebsites));
    }
}, []);

useEffect(() => {
    // שמירת האתרים בכל שינוי
    localStorage.setItem('websites', JSON.stringify(websites));
}, [websites]);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  // שדות לאתר חדש
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [newWebsiteUsername, setNewWebsiteUsername] = useState('');
  const [newWebsitePassword, setNewWebsitePassword] = useState('');
  const [newWebsiteTags, setNewWebsiteTags] = useState('');

  // פונקציה להוספת אתר חדש
  const addWebsite = () => {
    if (newWebsiteName.trim() === '' || 
        newWebsiteUrl.trim() === '' || 
        newWebsiteUsername.trim() === '' || 
        newWebsitePassword.trim() === '') {
      alert('נא למלא את כל השדות');
      return;
    }
    
    try {
      new URL(newWebsiteUrl);
    } catch {
      alert('נא להזין כתובת אתר תקינה');
      return;
    }

    const tags = newWebsiteTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const newWebsite = {
      id: Math.max(0, ...websites.map(w => w.id)) + 1,
      name: newWebsiteName.trim(),
      url: newWebsiteUrl.trim(),
      username: newWebsiteUsername.trim(),
      appPassword: newWebsitePassword.trim(),
      tags: tags
    };

    const updatedWebsites = [...websites, newWebsite];
    setWebsites(updatedWebsites);
    localStorage.setItem('websites', JSON.stringify(updatedWebsites));
    
    setNewWebsiteName('');
    setNewWebsiteUrl('');
    setNewWebsiteUsername('');
    setNewWebsitePassword('');
    setNewWebsiteTags('');
};

  // פונקציה לבדיקת חיבור לוורדפרס
  const testConnection = async (website) => {
    try {
      const response = await fetch(`${website.url}/wp-json/wp/v2/posts`, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${website.username}:${website.appPassword}`)
        }
      });
      
      if (response.ok) {
        alert('החיבור לאתר תקין!');
      } else {
        alert('שגיאה בחיבור לאתר. אנא בדוק את פרטי ההתחברות.');
      }
    } catch (error) {
      alert('שגיאה בחיבור לאתר. אנא בדוק שהכתובת נכונה ושה-API של וורדפרס פעיל.');
    }
  };

  const deleteWebsite = (id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את האתר?')) {
      const updatedWebsites = websites.filter(website => website.id !== id);
setWebsites(updatedWebsites);
    }
  };

  const uploadPost = async () => {
    if (!selectedFile || !selectedWebsite) return;
    
    setIsUploading(true);
    const website = websites.find(w => w.id === parseInt(selectedWebsite));
    if (!website) return;
  
    try {
      // נעבור על כל הקבצים שנבחרו
      for (const file of selectedFile) {
        try {
          // קריאת הקובץ והמרה ל-HTML
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({arrayBuffer});
          const htmlContent = result.value;
  
          // יצירת פוסט עם התוכן המומר
          const postResponse = await fetch(`${website.url}/wp-json/wp/v2/posts`, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${website.username}:${website.appPassword}`),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: file.name.replace('.docx', '').replace('.doc', ''),
              content: htmlContent,
              status: 'publish'
            })
          });
  
          if (!postResponse.ok) {
            throw new Error(`שגיאה ביצירת הפוסט ${file.name}`);
          }
  
          const newPost = await postResponse.json();
          
          // עדכון הטבלה
          setArticles(prev => [...prev, {
            name: file.name,
            status: 'פורסם בהצלחה',
            website: website.name,
            url: newPost.link
          }]);
  
        } catch (error) {
          setArticles(prev => [...prev, {
            name: file.name,
            status: 'נכשל',
            website: website.name,
            error: error.message
          }]);
        }
      }
      alert('תהליך ההעלאה הסתיים');
    } catch (error) {
      alert('שגיאה כללית: ' + error.message);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
    {/* כותרת ראשית וכפתור ניהול */}
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">מערכת העלאת מאמרים</h1>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            ניהול אתרים
          </button>
        </div>
      </div>
    </div>

    {/* תוכן ראשי */}
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* פאנל חיפוש וסינון - צד ימין */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">סינון אתרים</h2>
            
            {/* חיפוש חופשי */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">חיפוש חופשי</label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="הקלד שם אתר..."
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* בחירת תגית */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סינון לפי תגית</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">כל התגיות</option>
                {[...new Set(websites.flatMap(website => website.tags))].map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* בחירת אתר */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">בחירת אתר</label>
              <select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">בחר אתר...</option>
                {getFilteredWebsites().map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* אזור העלאה והצגת מאמרים - צד שמאל */}
        <div className="lg:col-span-2">
          {/* אזור העלאת קבצים */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">העלאת מאמרים</h2>
            <input
              type="file"
              accept=".doc,.docx"
              multiple
              onChange={(e) => setSelectedFile(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500 mb-4
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                focus:outline-none"
            />
            {selectedFile?.length > 0 && selectedWebsite && (
              <div>
                <button
                  onClick={() => uploadPost()}
                  disabled={isUploading}
                  className={`bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? 'מעלה...' : `העלה ${selectedFile.length} מאמרים`}
                </button>
                <div className="mt-4 space-y-2">
                  {selectedFile.map(file => (
                    <div key={file.name} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedFile?.length > 0 && !selectedWebsite && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                יש לבחור אתר לפני העלאת המאמרים
              </div>
            )}
          </div>

          {/* טבלת המאמרים */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">היסטוריית העלאות</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם המאמר
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      אתר
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                        טרם הועלו מאמרים
                      </td>
                    </tr>
                  ) : (
                    articles.map((article, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {article.name}
                        </td>
                        <td className={`px-6 py-4 text-sm ${
                          article.status === 'נכשל' ? 'text-red-500' : 
                          article.status === 'פורסם בהצלחה' ? 'text-green-500' : 
                          'text-gray-500'
                        }`}>
                          {article.status}
                          {article.error && (
                            <div className="text-xs text-red-400 mt-1">{article.error}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {article.website}
                          {article.url && (
                            <a href={article.url} target="_blank" rel="noopener noreferrer" 
                               className="block text-blue-500 hover:text-blue-700 text-xs mt-1">
                              צפה בפוסט
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* מודאל ניהול אתרים */}
    {isManageModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">ניהול אתרי וורדפרס</h2>
          </div>
          
          <div className="p-6 overflow-y-auto">
            {/* טופס הוספת אתר */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">הוספת אתר חדש</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newWebsiteName}
                  onChange={(e) => setNewWebsiteName(e.target.value)}
                  placeholder="שם האתר"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="url"
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                  placeholder="כתובת האתר (URL)"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newWebsiteUsername}
                  onChange={(e) => setNewWebsiteUsername(e.target.value)}
                  placeholder="שם משתמש"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newWebsitePassword}
                  onChange={(e) => setNewWebsitePassword(e.target.value)}
                  placeholder="Application Password"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newWebsiteTags}
                  onChange={(e) => setNewWebsiteTags(e.target.value)}
                  placeholder="תגיות (מופרדות בפסיק)"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                />
              </div>
              <button
                onClick={addWebsite}
                className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                הוסף אתר
              </button>
            </div>

            {/* רשימת האתרים */}
            <div className="space-y-4">
              {websites.map((website) => (
                <div key={website.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{website.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">{website.url}</div>
                      <div className="flex gap-2 mt-2">
                        {website.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => testConnection(website)}
                        className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      >
                        בדוק חיבור
                      </button>
                      <button
                        onClick={() => deleteWebsite(website.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsManageModalOpen(false)}
              className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                סגור
              </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}