
// Icons
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon'
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon'
import BoltIcon from '@heroicons/react/24/outline/BoltIcon'
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon'
import UsersIcon from '@heroicons/react/24/outline/UsersIcon'
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon'
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon'
import ChartPieIcon from '@heroicons/react/24/outline/ChartPieIcon'
import UserIcon from '@heroicons/react/24/outline/UserIcon'
import InboxIcon  from '@heroicons/react/24/outline/InboxIcon';
import CheckCircleIcon  from '@heroicons/react/24/outline/CheckCircleIcon';
import FolderIcon  from '@heroicons/react/24/outline/FolderIcon';
import ClipboardDocumentListIcon from '@heroicons/react/24/outline/ClipboardDocumentListIcon';
import ClipboardIcon from '@heroicons/react/24/outline/ClipboardIcon';
import Bars3BottomLeftIcon from '@heroicons/react/24/outline/Bars3BottomLeftIcon';
import { MilestoneIcon } from 'lucide-react'
import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon'
import IdentificationIcon from '@heroicons/react/24/outline/IdentificationIcon'

const iconClasses = `h-6 w-6`
const submenuIconClasses = `h-5 w-5`

const routes = [
  {
    path: '/app/dashboard',
    icon: <Squares2X2Icon className={iconClasses}/>, 
    name: 'Dashboard',
  },
  {
    path: '', 
    icon: <UsersIcon className={`${iconClasses} inline`}/>, 
    name: 'Users',
    submenu: [
      {
        path: '/app/user-management',
        icon: <UserIcon className={submenuIconClasses}/>,
        name: 'User',
      },
      {
        path: '/app/account-managers',
        icon: <IdentificationIcon className={submenuIconClasses}/>, 
        name: 'Management Account',
      },
    ]
  },
  {
    path: '/app/team',
    icon: <UserGroupIcon className={submenuIconClasses}/>,
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
        name: 'List',
      },
      {
        path: '/app/project-assign',
        icon: <FolderIcon className={submenuIconClasses}/>, 
        name: 'Assign project',
      },
      {
        path: '/app/project-completed',
        icon: <CheckCircleIcon className={submenuIconClasses} />,
        name: 'Completed',
      },
    ]
  },  
  {
    path: '/app/category',
    icon: <DocumentDuplicateIcon className={iconClasses}/>,
    name: 'Category',
  },
  {
    path: '', 
    icon: <ClipboardIcon className={`${iconClasses} inline`}/>, 
    name: 'Criteria',
    submenu: [
      {
        path: '/app/criteria',
        icon: <ClipboardDocumentListIcon className={submenuIconClasses}/>,
        name: 'List',
      },
      {
        path: '/app/criteria-type',
        icon: <Bars3BottomLeftIcon className={submenuIconClasses} />,
        name: 'Type',
      },
    ]
  }, 
  {
    path: '/app/transactions', 
    icon: <CurrencyDollarIcon className={iconClasses}/>, 
    name: 'Transactions',
  },
  {
    path: '/app/phase-rules',
    icon: <MilestoneIcon className={iconClasses} />,
    name: 'Phase Rules',
  },
  {
    path: '/app/global-settings',
    icon: <AdjustmentsHorizontalIcon className={iconClasses} />,
    name: 'Global Settings',
  },
  {
    path: '', 
    icon: <ExclamationTriangleIcon className={`${iconClasses} inline`}/>, 
    name: 'Requests & Reports', 
    submenu: [
      {
        path: '/app/request',
        icon: <InboxIcon className={submenuIconClasses}/>,
        name: 'Requests',
      },
      {
        path: '/app/report-project',
        icon: <ChartPieIcon className={submenuIconClasses}/>,
        name: 'Project Reports',
      }
    ]
  },
]

export default routes
