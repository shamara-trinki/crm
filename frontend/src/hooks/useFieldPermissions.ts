// E:\SVG\crm\frontend\src\hooks\useFieldPermissions.ts
import { useAuth } from '@/contexts/AuthContext';

export const useFieldPermissions = (module: string) => {
  const { hasPermission } = useAuth();

  const canViewField = (field: string): boolean => {
    return hasPermission(`${module}_${field.toUpperCase()}_VIEW`);
  };

  const canUpdateField = (field: string): boolean => {
    return hasPermission(`${module}_${field.toUpperCase()}_UPDATE`);
  };

  const canCreate = (): boolean => {
    return hasPermission(`${module}_CREATE`);
  };

  const canDelete = (): boolean => {
    return hasPermission(`${module}_DELETE`);
  };

  const getVisibleFields = (fields: string[]): string[] => {
    return fields.filter(field => canViewField(field));
  };

  const getUpdateableFields = (fields: string[]): string[] => {
    return fields.filter(field => canUpdateField(field));
  };

  return {
    canViewField,
    canUpdateField,
    canCreate,
    canDelete,
    getVisibleFields,
    getUpdateableFields,
  };
};