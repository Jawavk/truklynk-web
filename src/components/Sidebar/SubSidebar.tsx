import { useState } from 'react';
import * as Icons from 'lucide-react';
import { MenuItem } from '../../types/type';
import { useTheme } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface SubSidebarProps {
    menuItem: MenuItem | null;
    onBack: () => void;
}

export const SubSidebar = ({ menuItem, onBack }: SubSidebarProps) => {
    const { currentTheme } = useTheme();
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const navigate = useNavigate();

    if (!menuItem) return null;

    const handleItemClick = (subItem: MenuItem) => {
        console.log('Clicked route:', subItem.route);
        if (subItem.submenu) {
            setExpandedItem(expandedItem === subItem.name ? null : subItem.name);
        } else {
            navigate(subItem.route || '/');
            onBack();
        }
    };



    return (
        <div
            style={{
                backgroundColor: '#ebb7f1',
                borderColor: currentTheme.colors.primaryBorder,
            }}
            className="w-[250px] h-screen shadow-lg overflow-y-auto scrollbar-hidden"
        >
            <div
                // style={{
                //     backgroundColor: currentTheme.colors.primary,
                //     borderColor: currentTheme.colors.primaryBorder,
                // }}
                className='p-4 mt- relative flex gap-2 justify-between group sticky top- z-10 '
                style={{ backgroundColor: 'violet' }}
            >
                <h2
                    style={{
                        color: currentTheme.colors.text,
                        borderLeft: `2px solid ${currentTheme.colors.accent}`,
                    }}
                    className=" text-lg font-semibold pl-2"
                >
                    {menuItem.name}
                </h2>
                <button
                    style={{ color: currentTheme.colors.text }}
                    onClick={onBack}
                    className="flex items-center space-x-1.5 text-sm"
                >
                    <Icons.ChevronLeft
                        size={14}
                        className="transform group-hover:-translate-x-1 transition-transform"
                    />
                    <span className="opacity-75 hover:opacity-100">Return</span>
                </button>
            </div>

            <div className="p-2">
                {/* Features List */}


                {/* Submenu with Expandable Items */}
                {menuItem.submenu && (
                    <div className="space-y-2">
                        {menuItem.submenu.map((subItem) => (
                            <div
                                key={subItem.name}
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    borderLeft: expandedItem === subItem.name
                                        ? `2px solid ${currentTheme.colors.accent}`
                                        : '2px solid transparent'
                                }}
                                className="rounded-lg overflow-hidden group/item transition-all
                                    hover:shadow-md "
                            >
                                <button
                                    onClick={() => handleItemClick(subItem)}
                                    style={{
                                        color: currentTheme.colors.text,
                                        backgroundColor: expandedItem === subItem.name
                                            ? `${currentTheme.colors.primaryLight}`
                                            : 'transparent',
                                    }}
                                    className="w-full flex items-center justify-between p-2.5"
                                >
                                    <div className="flex items-center space-x-2">
                                        {subItem.icon && (
                                            <div
                                                style={{
                                                    backgroundColor: expandedItem === subItem.name
                                                        ? currentTheme.colors.secondary
                                                        : currentTheme.colors.primaryLight,
                                                }}
                                                className="rounded-md transform transition-all
                                                    group-hover/item:scale-105"
                                            >
                                                <subItem.icon width={12} height={12} />
                                            </div>
                                        )}
                                        <span className="text-sm tracking-wide">
                                            {subItem.name}
                                        </span>
                                    </div>
                                    {subItem.submenu && <Icons.ChevronDown size={14} />}
                                </button>

                                {subItem.submenu && (
                                    <div className={`overflow-hidden transition-all duration-300
                                        ${expandedItem === subItem.name ? 'max-h-[400px] overflow-y-auto scrollbar-hidden' : 'max-h-0'}`}>
                                        <div
                                            style={{
                                                borderColor: currentTheme.colors.primaryBorder,
                                                backgroundColor: currentTheme.colors.primaryLight
                                            }}
                                            className="p-2 space-y-1.5 border-t"
                                        >
                                            {subItem.submenu?.map((menu) => (
                                                <div
                                                    key={menu.name}
                                                    onClick={() => {
                                                        navigate(menu.route || '/')
                                                        onBack();
                                                    }}
                                                    style={{
                                                        color: currentTheme.colors.text,
                                                        backgroundColor: currentTheme.colors.primary,
                                                    }}
                                                    className="group flex items-center p-2 rounded-md
                                                        hover:translate-x-1 transition-all cursor-pointer
                                                        hover:shadow-sm"
                                                >
                                                    <div className="p-0 rounded-md mr-2">
                                                        <menu.icon width={12} height={12} />
                                                    </div>
                                                    <span className="text-sm">
                                                        {menu.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 