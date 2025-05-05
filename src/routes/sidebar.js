
// Icons
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon'
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon'
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon'
import BoltIcon from '@heroicons/react/24/outline/BoltIcon'
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon'
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon'
// import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon'
// import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon'
// import CodeBracketSquareIcon from '@heroicons/react/24/outline/CodeBracketSquareIcon'
import UsersIcon from '@heroicons/react/24/outline/UsersIcon'
// import WalletIcon from '@heroicons/react/24/outline/WalletIcon'
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon'
import ChartPieIcon from '@heroicons/react/24/outline/ChartPieIcon'
// import UserIcon from '@heroicons/react/24/outline/UserIcon'
// import TableCellsIcon from '@heroicons/react/24/outline/TableCellsIcon';
import InboxIcon  from '@heroicons/react/24/outline/InboxIcon';
import CheckCircleIcon  from '@heroicons/react/24/outline/CheckCircleIcon';
import FolderIcon  from '@heroicons/react/24/outline/FolderIcon';
import ClipboardDocumentListIcon from '@heroicons/react/24/outline/ClipboardDocumentListIcon';
import ClipboardIcon from '@heroicons/react/24/outline/ClipboardIcon';
import Bars3BottomLeftIcon from '@heroicons/react/24/outline/Bars3BottomLeftIcon';
import { MilestoneIcon } from 'lucide-react'
import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon'


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
