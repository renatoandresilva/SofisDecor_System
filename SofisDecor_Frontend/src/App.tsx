import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout';
import { auth } from './service/dataConnection'
// pages
import Home from './pages/home';
import Sale from './pages/sale';
import SaleList from './pages/saleList';
import Client from './pages/client';
import Controller from './pages/controller';
import Cost from './pages/cost';
import CostDetail from './pages/cost_detail';

import Login from './pages/login/Login';
import Catalog from './pages/catalog';
import CatalogDetail from './pages/catalog_detail';
import CatalogHome from './pages/catalog_home';
import ClientDetail from './pages/client_detail';

import Private from './router/Private';

// Types
type userPermissionId = {
  id_1: string,
  id_2: string,
}

const userPermission: userPermissionId = {
  id_1: '6P8ys4sbFGebko95Yhx7N6iGi052',
  id_2: 'Fz7fEUKj38UmwwtyEuqZMXIUZ763'
}

auth.onAuthStateChanged((user) => {
  if (user?.uid === userPermission.id_1 || user?.uid === userPermission.id_2) {
    const userPermission = {
      userId: user?.uid,
      isPermeted: true
    }
    localStorage.setItem('@user:', JSON.stringify(userPermission))
  } else {
    const userPermission = {
      userId: user?.uid,
      isPermeted: false
    }
    localStorage.setItem('@user:', JSON.stringify(userPermission))
  }
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Private><Home /></Private>
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/sale',
        element: <Private> <SaleList /></Private>
      },
      {
        path: '/sale/:id?',
        element: <Private><Sale /></Private>
      },

      {
        path: '/client',
        element: <Private><Client /></Private>
      },
      {
        path: '/client_detail/:id',
        element: <ClientDetail />
      },
      {
        path: '/cost',
        element: <Private><Cost /></Private>
      },
      {
        path: '/cost/:id?',
        element: <Private><CostDetail /></Private>
      },
      {
        path: '/controller',
        element: <Private><Controller /></Private>
      },
      {
        path: '/catalog',
        element: <Catalog />
      },
      {
        path: '/catalog_detail/:id',
        element: <Private><CatalogDetail /></Private>
      },
      {
        path: '/catalog_home/:id',
        element: <CatalogHome />
      },

    ]
  }
])

export default router