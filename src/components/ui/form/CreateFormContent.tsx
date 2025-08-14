import { useState } from 'react';

export const CreateFormContent = () => {
  // State management for form inputs and feedback
  const [jsonInput, setJsonInput] = useState('');
  const [formConfig, setFormConfig] = useState<any>(null);
  const [error, setError] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  // Handle JSON input changes
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setFormConfig(parsed);
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  // Copy generated code to clipboard
  const copyToClipboard = () => {
    if (formConfig) {
      navigator.clipboard.writeText(generateReactCode(formConfig));
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }
  };

  return (
    <div className='w-[100%] flex gap-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Left side - JSON input */}
      <div className='w-1/2 space-y-6'>
        <div className='flex flex-col space-y-2'>
          <h2 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600'>
            Form Configuration
          </h2>
          <p className='text-gray-500'>Paste your JSON configuration below</p>
        </div>
        <div className='relative group'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000'></div>
          <textarea
            className='relative w-full h-[calc(100vh-250px)] p-6 font-mono text-sm border-0 rounded-xl shadow-lg bg-white/90 backdrop-blur-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none'
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder='{ ... }'
          />
          {error && (
            <div className='absolute bottom-4 left-4 right-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg backdrop-blur-sm'>
              <div className='flex items-center space-x-2'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Generated React Code */}
      <div className='w-1/2 space-y-6'>
        <div className='flex justify-between items-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600'>
              Generated Code
            </h2>
            <p className='text-gray-500'>Ready to use React component</p>
          </div>
          <button
            onClick={copyToClipboard}
            className='group relative inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-200 ease-in-out transform hover:scale-105'
          >
            <span className='absolute inset-0 w-full h-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-200 ease-in-out group-hover:opacity-90 shadow-lg group-hover:shadow-indigo-500/50'></span>
            <span className='relative flex items-center space-x-2'>
              {showCopyFeedback ? (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                    />
                  </svg>
                  <span>Copy Code</span>
                </>
              )}
            </span>
          </button>
        </div>
        <div className='relative group'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000'></div>
          <pre className='relative h-[calc(100vh-250px)] p-6 bg-white/90 backdrop-blur-sm border-0 rounded-xl shadow-lg overflow-auto'>
            <code className='text-sm font-mono selection:bg-indigo-100 selection:text-indigo-900'>
              {formConfig
                ? generateReactCode(formConfig)
                : 'Enter valid JSON to see the generated React code'}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const generateReactCode = (config: any) => {
  // Add early return if config is invalid
  if (!config || !config.fields || !Array.isArray(config.fields)) {
    return 'Invalid configuration: Unable to generate code';
  }

  // Defensive programming: provide default values
  const safeConfig = {
    component: config.component || 'GenericForm',
    formTitle: config.formTitle || 'Form',
    description: config.description || '',
    submitButton: config.submitButton || { label: 'Submit', endpoint: '/submit' },
    resetButton: config.resetButton || { label: 'Reset' },
    fields: config.fields || [],
    endpoint: config.endpoint || '/submit',
    editPath: config.editPath || '/edit',
    createPath: config.createPath || '/create',
  };

  // Updated imports generation to avoid duplicates
  const getRequiredImports = (fields: any[]) => {
    const importMap = {
      react: new Set(['React', 'useEffect', 'useState']),
      reactHookForm: new Set(['useForm', 'FormProvider', 'Controller']),
      components: new Set(['Button']), // Always include Button
      services: new Set(['get', 'post', 'put']),
      contexts: new Set(['useToast']),
    };

    (fields || []).forEach((field) => {
      if (!field) return;

      switch (field.type) {
        case 'select':
          importMap.components.add('Select');
          break;
        case 'autocomplete':
          importMap.components.add('Autocomplete');
          break;
        case 'radio':
          importMap.components.add('RadioGroup');
          break;
        case 'checkbox':
          importMap.components.add('Checkbox');
          break;
        case 'file':
          importMap.components.add('FileInput');
          break;
        default:
          importMap.components.add('Input');
      }
    });

    return [
      `import { ${Array.from(importMap.react).join(', ')} } from 'react';`,
      `import { useParams } from 'react-router-dom';`,
      `import { ${Array.from(importMap.reactHookForm).join(', ')} } from 'react-hook-form';`,
      ...Array.from(importMap.components).map(
        (component) => `import { ${component} } from '@/components/ui/form/${component}';`,
      ),
      `import { ${Array.from(importMap.services).join(', ')} } from '@/services/api/apiService';`,
      `import { ${Array.from(importMap.contexts).join(', ')} } from '@/context/ToastContext';`,
    ].join('\n');
  };

  // Helper function to convert snake_case to camelCase
  const toCamelCase = (str: string) => {
    // First, handle special case for "name" suffix
    if (str.endsWith('_name')) {
      const base = str.slice(0, -5); // Remove '_name'
      return base.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase()) + 'Name';
    }
    // Handle regular snake_case to camelCase conversion
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  // Updated interface generation to include id for edit mode
  const generateInterface = (fields: any[]) => {
    const interfaceProps = fields
      ?.map((field) => {
        const camelCaseName = toCamelCase(field.name);
        let type = 'string'; // default type

        switch (field.type) {
          case 'select':
          case 'autocomplete':
            // Handle numeric or boolean values for select/autocomplete
            type =
              field.valueType === 'number'
                ? 'number'
                : field.valueType === 'boolean'
                  ? 'boolean'
                  : 'string';
            break;
          case 'checkbox':
            type = 'boolean';
            break;
          case 'number':
          case 'range':
            type = 'number';
            break;
          case 'file':
            type = field.multiple ? 'File[]' : 'File';
            break;
          case 'date':
          case 'datetime-local':
            type = 'Date';
            break;
          case 'radio':
            // For radio buttons, we can make it a union type if options are provided
            if (field.options) {
              const unionTypes = field.options
                .map((opt: any) => (typeof opt.value === 'string' ? `'${opt.value}'` : opt.value))
                .join(' | ');
              type = unionTypes || 'string';
            }
            break;
          default:
            type = 'string';
        }

        // Handle optional fields
        const isOptional = !field.required;
        return `    ${camelCaseName}${isOptional ? '?' : ''}: ${type};`;
      })
      .join('\n');

    return `interface ${safeConfig.component}Data {
    sessionUserId: number;
    id?: number;
${interfaceProps}
}

interface FieldConfiguration {
    fields: {
        display: string[];
        actions: string[];
    }
}`;
  };

  // Generate state variables for select options
  const generateSelectStates = (fields: any[]) => {
    return (fields || [])
      .filter((field) => field && (field.type === 'select' || field.type === 'autocomplete'))
      .map((field) => {
        const camelCaseName: any = toCamelCase(field.name);

        // If options are directly provided, use them
        if (field.options) {
          return `    const [${camelCaseName}Options, set${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options]:any = useState<Array<{ value: string, label: string }>>([
        ${field.options.map((opt: any) => `{ value: "${opt.value}", label: "${opt.label}" }`).join(',\n        ')}
    ]);`;
        }

        // If endpoint is provided, use the previous logic
        return `    const [${camelCaseName}Options, set${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options]:any = useState<Array<{ value: string, label: string }>>([]);`;
      })
      .join('\n');
  };

  // Generate useEffect hooks for fetching select options
  const generateSelectEffects = (fields: any[]) => {
    return fields
      .filter((field) => field.type === 'select' || field.type === 'autocomplete')
      .map((field) => {
        // If options are directly provided or no endpoint exists, return empty string
        if (field.options || !field.endpoint) {
          return '';
        }

        const camelCaseName: any = toCamelCase(field.name);
        const dependsOn = field.dependsOn ? toCamelCase(field.dependsOn) : null;
        const valueField = field.optionsMapping?.value || 'id';
        const labelField = field.optionsMapping?.label || 'name';

        if (dependsOn) {
          return `
useEffect(() => {
    const fetch${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options = async () => {
        try {
            const formValues = methods.getValues();
            if (formValues?.${dependsOn}) {
                const response: any = await get(\`${field.endpoint}?${dependsOn}=\${formValues.${dependsOn}}\`);
                const options = response?.data?.map((item: any) => ({
                    value: item['${valueField}'].toString(),
                    label: item['${labelField}']
                }));
                set${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options(options || []);
            }
        } catch (error) {
            console.error('Error fetching ${field.label} options:', error);
            showToast({
                message: 'Failed to load ${field.label} options',
                type: 'error'
            });
        }
    };

    fetch${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options();
}, [methods.watch('${dependsOn}')]);`;
        } else {
          return `
useEffect(() => {
    const fetch${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options = async () => {
        try {
            const response: any = await get('${field.endpoint}');
            const options = response?.data?.map((item: any) => ({
                value: item['${valueField}'].toString(),
                label: item['${labelField}']
            }));
            set${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options(options || []);
        } catch (error) {
            console.error('Error fetching ${field.label} options:', error);
            showToast({
                message: 'Failed to load ${field.label} options',
                type: 'error'
            });
        }
    };

    fetch${camelCaseName[0].toUpperCase()}${camelCaseName.slice(1)}Options();
}, []);`;
        }
      })
      .filter(Boolean) // Remove empty strings
      .join('\n');
  };

  // Add helper functions for field display control
  const generateHelperFunctions = () => `
    // Helper function to check if field should be displayed
    const shouldDisplayField = (fieldId: string) => {
        return config.fields.display.includes(fieldId);
    };

    // Helper function to check if action should be displayed
    const shouldDisplayAction = (actionId: string) => {
        return config.fields.actions.includes(actionId);
    };`;

  // Update form field generation to include display checks and IDs
  const generateFormFields = (fields: any[]) => {
    return fields
      ?.map((field) => {
        if (!field) return '';
        const camelCaseName = toCamelCase(field.name);

        const fieldWrapper = (content: string) => `
                {shouldDisplayField('${camelCaseName}') && (
                    ${content}
                )}`;

        const baseControllerProps = `
                name="${camelCaseName}"
                control={methods.control}
                rules={{
                    ${field.required ? `required: '${field.label} is required',` : ''}
                  
                }}`;

        switch (field.type) {
          case 'select':
            return fieldWrapper(`
                        <Controller
                            ${baseControllerProps}
                            render={({ field: controllerField }) => (
                                <Select
                                    id="${camelCaseName}"
                                    label="${field.label}"
                                    options={${camelCaseName}Options}
                                    placeholder="${field.placeholder || `Select ${field.label.toLowerCase()}`}"
                                    {...controllerField}
                                    onChange={(selectedOption) =>
                                        controllerField.onChange(
                                            selectedOption 
                                            ? (typeof ${camelCaseName}Options[0].value === 'boolean' 
                                                ? selectedOption.target.value === 'true' 
                                                : parseInt(selectedOption.target.value, 10)) 
                                            : null
                                        )
                                    }
                                />
                            )}
                        />`);

          case 'autocomplete':
            return fieldWrapper(`
                        <Controller
                            ${baseControllerProps}
                            render={({ field: controllerField }) => (
                                <Autocomplete
                                    id="${camelCaseName}"
                                    label="${field.label}"
                                    options={${camelCaseName}Options}
                                    placeholder="${field.placeholder || `Select ${field.label.toLowerCase()}`}"
                                    {...controllerField}
                                />
                            )}
                        />`);

          case 'radio':
            return fieldWrapper(`
                        <Controller
                            ${baseControllerProps}
                            render={({ field: controllerField }) => (
                                <RadioGroup
                                    id="${camelCaseName}"
                                    label="${field.label}"
                                    options={[
                                        ${field.options
                                          ?.map(
                                            (opt: any) =>
                                              `{ value: "${opt.value}", label: "${opt.label}" }`,
                                          )
                                          .join(',\n')}
                                    ]}
                                    {...controllerField}
                                />
                            )}
                        />`);

          case 'checkbox':
            return fieldWrapper(`
                        <Controller
                            ${baseControllerProps}
                            render={({ field: controllerField }:any) => (
                                <Checkbox
                                    id="${camelCaseName}"
                                    label="${field.label}"
                                    {...controllerField}
                                    checked={controllerField.value}
                                    onChange={(e:any) => controllerField.onChange(e.target.checked)}
                                />
                            )}
                        />`);

          case 'file':
            return fieldWrapper(`
                        <Controller
                            ${baseControllerProps}
                            render={({ field: controllerField }) => (
                                <FileInput
                                    id="${camelCaseName}"
                                    label="${field.label}"
                                    accept="${field.accept || '*'}"
                                    multiple={${field.multiple || false}}
                                    {...controllerField}
                                    onChange={(files) => controllerField.onChange(files)}
                                />
                            )}
                        />`);

          default: // Default to Input
            return fieldWrapper(`
                        <Controller
                            ${baseControllerProps}
                            render={({ field: controllerField }) => (
                                <Input
                                    id="${camelCaseName}"
                                    label="${field.label}"
                                    type="${field.inputType || 'text'}"
                                    placeholder="${field.placeholder || `Enter ${field.label.toLowerCase()}`}"
                                    {...controllerField}
                                />
                            )}
                        />`);
        }
      })
      .join('\n');
  };

  // Update button generation to include edit mode text
  const generateButtons = () => `
    <div className="flex gap-4 justify-end mt-4">
        {shouldDisplayAction('reset${config.component}') && (
            <Button id="reset${config.component}" variant="danger" type="button" onClick={() => methods.reset()}>
                Reset
            </Button>
        )}
        {shouldDisplayAction('create${config.component}') && (
            <Button id="create${config.component}" type="submit" variant="success">
                {isEditMode ? 'Update' : 'Create'} ${config.component}
            </Button>
        )}
    </div>`;

  // Just use the getRequiredImports result directly
  const imports = getRequiredImports(safeConfig.fields);

  // Update onSubmit function to use the correct endpoints from config
  const generateOnSubmit = () => `
    const onSubmit = async (data: ${safeConfig.component}Data) => {
        try {
            data.sessionUserId = 1;
            
            if (isEditMode) {
                await put(\`${config.submitButton.endpoint}/\${id}\`, data);
                showToast({
                    message: '${safeConfig.component} updated successfully',
                    type: 'success'
                });
            } else {
                await post('/masters${config.submitButton.endpoint}', data);
                showToast({
                    message: '${safeConfig.component} created successfully',
                    type: 'success'
                });
                methods.reset();
            }
        } catch (error: any) {
            showToast({
                message: error.message || \`Failed to \${isEditMode ? 'update' : 'create'} ${safeConfig.component.toLowerCase()}\`,
                type: 'error'
            });
            console.error(\`Error \${isEditMode ? 'updating' : 'creating'} ${safeConfig.component.toLowerCase()}:\`, error);
        }
    };`;

  // Updated component code with edit mode support
  return `${imports}

${generateInterface(safeConfig.fields)}

const config: FieldConfiguration = {
    fields: {
        display: [${safeConfig.fields.map((f: any) => `"${toCamelCase(f.name)}"`).join(', ')}],
        actions: ["create${safeConfig.component}", "reset${safeConfig.component}"]
    }
};

export default function ${safeConfig.component}Form() {
    const { showToast } = useToast();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    ${generateSelectStates(safeConfig.fields)}

    const methods = useForm<${safeConfig.component}Data>({
        defaultValues: {
            ${safeConfig.fields?.map((field: any) => `${toCamelCase(field.name)}: ${field.type === 'checkbox' ? 'false' : "''"}`).join(',\n            ')}
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const response: any = await get(\`${config.submitButton.endpoint}/\${id}\`);
                    methods.reset(response.data);
                } catch (error: any) {
                    showToast({
                        message: error.message || 'Failed to fetch ${safeConfig.component.toLowerCase()}',
                        type: 'error'
                    });
                }
            }
        };
        fetchData();
    }, [id]);

    ${generateHelperFunctions()}

    ${generateSelectEffects(safeConfig.fields)}

    ${generateOnSubmit()}

    return (
        <div className="mx-auto p-6 border rounded bg-card">
            <h2 className="text-2xl font-bold mb-2 text-foreground">
                {isEditMode ? 'Edit' : 'Create'} ${safeConfig.formTitle}
            </h2>
            <p className="text-muted-foreground mb-6">
                ${safeConfig.description || `Please fill out the details below to manage ${safeConfig.component.toLowerCase()} information.`}
            </p>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-4">
                        ${generateFormFields(safeConfig.fields)}
                    </div>
                    ${generateButtons()}
                </form>
            </FormProvider>
        </div>
    );
};`;
};
