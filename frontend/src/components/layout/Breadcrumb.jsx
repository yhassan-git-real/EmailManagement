import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex text-sm py-2 animate-fadeIn w-full z-20">
        <ol className="flex flex-wrap items-center w-full">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <div className="mx-1.5 text-gray-300 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}

                {isLast || !item.path ? (
                  <span
                    className={`flex items-center transition-all duration-300 ${isLast
                      ? 'bg-primary-50 text-primary-700 font-medium px-2 py-0.5 rounded-md border border-primary-100 shadow-sm'
                      : 'text-gray-500'}`}
                  >
                    {item.icon && (
                      <span className="mr-1.5 inline-flex items-center justify-center animate-fadeIn">
                        {item.icon}
                      </span>
                    )}
                    <span className="relative inline-block">
                      {item.label}
                      {isLast && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-300 rounded-full transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                      )}
                    </span>
                  </span>
                ) : item.external ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center text-gray-600 hover:text-primary-700 px-2 py-0.5 rounded-md hover:bg-primary-50/70 transition-all duration-200"
                  >
                    {item.icon && (
                      <span className="mr-1.5 inline-flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>
                    )}
                    <span className="relative inline-block">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-300 rounded-full transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </span>
                    {/* External link indicator */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1 text-gray-400 group-hover:text-primary-600 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className="group flex items-center text-gray-600 hover:text-primary-700 px-2 py-0.5 rounded-md hover:bg-primary-50/70 transition-all duration-200"
                  >
                    {item.icon && (
                      <span className="mr-1.5 inline-flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>
                    )}
                    <span className="relative inline-block">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-300 rounded-full transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
    </nav>
  );
};

// Home icon for the breadcrumb with enhanced styling
const HomeIcon = () => (
  <div className="rounded-md bg-primary-100/50 p-0.5">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  </div>
);

// Default breadcrumb with home icon
const DefaultBreadcrumb = () => (
  <Breadcrumb
    items={[
      { label: 'Home', path: '/', icon: <HomeIcon /> }
    ]}
  />
);

export { DefaultBreadcrumb, HomeIcon };
export default Breadcrumb;
