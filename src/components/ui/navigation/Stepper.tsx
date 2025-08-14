import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

interface Step {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    status?: 'completed' | 'current' | 'upcoming';
    disabled?: boolean;
}

// Add new styling variants using cva
const stepperVariants = cva('flex', {
    variants: {
        orientation: {
            horizontal: 'flex-row items-center',
            vertical: 'flex-col space-y-4'
        },
        size: {
            small: 'gap-4',
            medium: 'gap-6',
            large: 'gap-8'
        }
    },
    defaultVariants: {
        orientation: 'horizontal',
        size: 'medium'
    }
});

interface StepperProps extends VariantProps<typeof stepperVariants> {
    steps: Step[];
    currentStep: number;
    className?: string;
    showConnector?: boolean;
    onStepClick?: (index: number) => void;
    animate?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
    steps,
    currentStep,
    className,
    orientation = 'horizontal',
    size = 'medium',
    showConnector = true,
    onStepClick,
    animate = true
}) => {
    const { currentTheme } = useTheme();

    const sizeClasses = {
        small: 'w-6 h-6 text-xs',
        medium: 'w-8 h-8 text-sm',
        large: 'w-10 h-10 text-base'
    };

    const getStepStatus = (index: number) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'upcoming';
    };

    const stepVariants = {
        completed: {
            scale: [1, 1.1, 1],
            transition: { duration: 0.3 }
        },
        current: {
            scale: 1,
            transition: { duration: 0.3 }
        }
    };

    // Ensure that size is not null before using it as an index
    const sizeClass = size ? sizeClasses[size] : '';

    return (
        <div
            role="navigation"
            aria-label="Progress"
            className={cn(stepperVariants({ orientation, size }), className)}
        >
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div
                        className={cn(
                            'flex',
                            orientation === 'vertical' ? 'flex-row items-start' : 'flex-col items-center',
                            'relative'
                        )}
                    >
                        {/* Step Circle */}
                        <div
                            onClick={() => !step.disabled && onStepClick?.(index)}
                            // variants={animate ? stepVariants : {}}
                            // animate={getStepStatus(index)}
                            // whileHover={!step.disabled ? { scale: 1.05 } : undefined}
                            className={cn(
                                'rounded-full flex items-center justify-center',
                                sizeClass,
                                'transition-all duration-200',
                                onStepClick && !step.disabled && 'cursor-pointer',
                                step.disabled && 'opacity-50 cursor-not-allowed',
                                {
                                    'bg-primary-500 text-white': getStepStatus(index) === 'completed',
                                    'border-2 border-primary-500 text-primary-500': getStepStatus(index) === 'current',
                                    'border-2 border-gray-300 text-gray-300': getStepStatus(index) === 'upcoming'
                                }
                            )}
                            style={{
                                backgroundColor: getStepStatus(index) === 'completed' ? currentTheme.colors.primary : undefined,
                                borderColor: getStepStatus(index) !== 'upcoming' ? currentTheme.colors.primary : undefined
                            }}
                            role="button"
                            tabIndex={step.disabled ? -1 : 0}
                            aria-current={getStepStatus(index) === 'current' ? 'step' : undefined}
                            aria-disabled={step.disabled}
                        >
                            {getStepStatus(index) === 'completed' ? (
                                <Check className={sizeClass} />
                            ) : (
                                step.icon || (index + 1)
                            )}
                        </div>

                        {/* Step Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                'flex flex-col',
                                orientation === 'vertical' ? 'ml-4' : 'mt-2 text-center'
                            )}
                        >
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {step.label}
                            </span>
                            {step.description && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {step.description}
                                </span>
                            )}
                        </motion.div>
                    </div>

                    {/* Connector */}
                    {showConnector && index < steps.length - 1 && (
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                                'flex-1',
                                orientation === 'vertical'
                                    ? 'w-px h-full ml-4 border-l-2'
                                    : 'h-px w-full border-t-2',
                                index < currentStep
                                    ? 'border-primary-500'
                                    : 'border-gray-300'
                            )}
                            style={{
                                borderColor: index < currentStep ? currentTheme.colors.primary : undefined,
                                transformOrigin: orientation === 'vertical' ? 'top' : 'left'
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}; 