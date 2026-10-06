import {
  AlphabetIcon,
  HomeIcon,
  WindowIcon,
  TableIcon,
  UserIcon,
  Widget4Icon,
  TaskIcon,
  UserGroupIcon,
  BuildingIcon,
  InvoiceIcon,
  LetterIcon
} from "./icon";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboards",
        icon: <HomeIcon />,
        items: [
          {
            title: "CRM Dashboard",
            url: "/dashboard",
          },
          
        ],
      },    
        {
        title: "Leads",
        icon: <WindowIcon />,
        items: [
          {
            title: "Follow up",
            url: "/leads",
          },
          
        ],
      }, 
         {
        title: "Customers",
        icon: <UserGroupIcon />,
        items: [
          {
            title: "Add Customers",
            url: "/customers/add-customer",
          },
          {
            title: "Customers List",
            url: "/customers/list",
          },
        ],
      },
       {
        title: "Property",
        icon: <BuildingIcon />,
        items: [
          {
            title: "Add Property",
            url: "/property/add-property",
          },
          {
            title: "Property List",
            url: "/property/list",
          },
        ],
      },
         {
        title: "Invoices",
        icon: <InvoiceIcon />,
        items: [
          {
            title: "Generate Invoices",
            url: "/invoice/gr-invoice",
          },
          {
            title: "Invoice List",
            url: "/invoice/list",
          },
        ],
      },
       {
        title: "Purchase Orders",
        icon: <TaskIcon />,
        items: [
          {
            title: "Generate Purchase Order",
            url: "/property/sale",
          },
                    {
            title: "Purchase Order List",
            url: "/property/purchase-orders",
          },
        ],
      },
      {
        title: "Reports",
        icon: <LetterIcon />,
        items: [
          {
            title: "Customer Report",
            url: "/customerreport",
          },
                    {
            title: "Property Report",
            url: "/propertyreport",
          },
          {
            title: "Invoice Report",
            url: "/invoicereport",
          },
          {
            title: "Purchase Order Report",
            url: "/purchaseorderreport",
          },
        ],
      },
      {
        title: "Uploads",
        icon: <TableIcon />,
        items: [
          {
            title: "Upload Gards Data",
            url: "/uploadinformation",
          },
        ],
      },
      {
        title: "Search",
        icon: <AlphabetIcon />,
        items: [
          {
            title: "Overall Search",
            url: "/search",
          },
          // {
          //   title: "Terms & Conditions",
          //   url: "/terms-and-conditions",
          // },
          // {
          //   title: "Mail Success",
          //   url: "/mail-success",
          // },
        ],
      },
    ],
  },
  // {
  //   label: "OTHERS",
  //   items: [
  //     {
  //       title: "Charts",
  //       icon: <PieChartIcon />,
  //       items: [
  //         {
  //           title: "Line Charts",
  //           url: "/charts/line-charts",
  //         },
  //         {
  //           title: "Bar Charts",
  //           url: "/charts/bar-charts",
  //         },
  //         {
  //           title: "Pie Charts",
  //           url: "/charts/pie-charts",
  //         },
  //       ],
  //     },
  //     {
  //       title: "UI Elements",
  //       icon: <Widget4Icon />,
  //       items: [
  //         {
  //           title: "Accordion",
  //           url: "/ui-elements/accordion",
  //         },
  //         {
  //           title: "Avatars",
  //           url: "/ui-elements/avatars",
  //         },
  //         {
  //           title: "Buttons",
  //           url: "/ui-elements/buttons",
  //         },
  //         {
  //           title: "Breadcrumbs",
  //           url: "/ui-elements/breadcrumbs",
  //         },
  //         {
  //           title: "Progress",
  //           url: "/ui-elements/progress",
  //         },
  //         {
  //           title: "Tooltips",
  //           url: "/ui-elements/tooltips",
  //         },
  //       ],
  //     },
  //   ],
  // },
];
