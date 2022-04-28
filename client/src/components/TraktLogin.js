import React from 'react';

export default function TraktLogin() {

  const test = async () => {
    const response = await fetch('/api/auth/trakt/', {redirect: 'follow'});
    const data = await response.json();
    console.log(data);
    return data
  }

// janiga7049@kuruapp.com
// 12345
  return (
    <div className="mt-3 mx-auto">
      {/* <p onClick={test}>Trakt Login</p> */}
      <a href="https://trakt.tv/oauth/authorize?response_type=code&client_id=d8d53713174f7e7c7f428774b90475238f175543469fab4ff3f0e295676e2279&redirect_uri=http://localhost:5000/api/auth/trakt/callback">Trakt Login</a>
    </div>
  );
}
