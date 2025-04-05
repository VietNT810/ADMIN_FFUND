
// Icons
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon'
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon'
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon'
import BoltIcon from '@heroicons/react/24/outline/BoltIcon'
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon'
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon'
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon'
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon'
import CodeBracketSquareIcon from '@heroicons/react/24/outline/CodeBracketSquareIcon'
import UsersIcon from '@heroicons/react/24/outline/UsersIcon'
import WalletIcon from '@heroicons/react/24/outline/WalletIcon'
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon'
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon'
import UserIcon from '@heroicons/react/24/outline/UserIcon'
import TableCellsIcon from '@heroicons/react/24/outline/TableCellsIcon';

const iconClasses = `h-6 w-6`
const submenuIconClasses = `h-5 w-5`

const routes = [
  {
    path: '/app/dashboard',
    icon: <Squares2X2Icon className={iconClasses}/>, 
    name: 'Dashboard',
  },
  {
    path: '/app/user-management', 
    icon: <UsersIcon className={iconClasses}/>,
    name: 'User',
  },
  {
    path: '/app/team',
    icon: <UsersIcon className={submenuIconClasses}/>,
    name: 'Team',
  },
  {
    path: '', 
    icon: <BoltIcon className={`${iconClasses} inline`}/>, 
    name: 'Project', 
    submenu: [
      {
        path: '/app/project-list',
        icon: <Squares2X2Icon className={submenuIconClasses}/>,
        name: 'Project List',
      },
      {
        path: '/app/project-requests',
        icon: <CurrencyDollarIcon className={submenuIconClasses}/>, 
        name: 'Project Requests', 
      },
      {
        path: '/app/project-settings',
        icon: <Cog6ToothIcon className={submenuIconClasses}/>,
        name: 'Project Settings',
      },
    ]
  },  
  {
    path: '/app/category',
    icon: <DocumentDuplicateIcon className={iconClasses}/>,
    name: 'Category',
  },
  {
    path: '/app/transactions', 
    icon: <CurrencyDollarIcon className={iconClasses}/>, 
    name: 'Transactions',
  },
  {
    path: '/app/charts', 
    icon: <ChartBarIcon className={iconClasses}/>, 
    name: 'Analytics',
  },
  {
    path: '/app/calendar', 
    icon: <CalendarDaysIcon className={iconClasses}/>, 
    name: 'Calendar',
  },
  {
    path: '', 
    icon: <Cog6ToothIcon className={`${iconClasses} inline` }/>, 
    name: 'Settings', 
    submenu : [
      {
        path: '/app/settings-profile', 
        icon: <UserIcon className={submenuIconClasses}/>, 
        name: 'Profile', 
      },
      {
        path: '/app/settings-billing',
        icon: <WalletIcon className={submenuIconClasses}/>,
        name: 'Billing',
      },
      {
        path: '/app/settings-team',
        icon: <UsersIcon className={submenuIconClasses}/>,
        name: 'Team Members',
      },
    ]
  },
  {
    path: '', 
    icon: <DocumentTextIcon className={`${iconClasses} inline`}/>, 
    name: 'Documentation', 
    submenu : [
      {
        path: '/app/getting-started', 
        icon: <DocumentTextIcon className={submenuIconClasses}/>, 
        name: 'Getting Started',
      },
      {
        path: '/app/features',
        icon: <TableCellsIcon className={submenuIconClasses}/>, 
        name: 'Features',
      },
      {
        path: '/app/components',
        icon: <CodeBracketSquareIcon className={submenuIconClasses}/>, 
        name: 'Components',
      }
    ]
  },
]

export default routes
