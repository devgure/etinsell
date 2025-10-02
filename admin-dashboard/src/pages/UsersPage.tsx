import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => { adminApi.getUsers().then(setUsers); }, []);
  return (
    <div>
      <h1>Users</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
