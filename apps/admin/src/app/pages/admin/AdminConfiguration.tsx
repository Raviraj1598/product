import { useEffect, useState } from 'react';
import type { StoreSettings } from '@boutique/shared';
import { mergeStoreSettings, useStore } from '@boutique/shared';
import { toast } from 'sonner';
import { ConfigurationShell } from '../../components/configuration/ConfigurationShell';
import { ConfigSectionPanels } from '../../components/configuration/ConfigSectionPanels';

/** Magento 2–style system configuration (Stores → Configuration). */
export default function AdminConfiguration() {
  const { settings, setSettings } = useStore();
  const [draft, setDraft] = useState<StoreSettings>(() => mergeStoreSettings(settings));

  useEffect(() => {
    setDraft(mergeStoreSettings(settings));
  }, [settings]);

  const save = () => {
    setSettings(draft);
    toast.success('Configuration saved');
  };

  return (
    <ConfigurationShell onSave={save}>
      {(section) => <ConfigSectionPanels section={section} draft={draft} setDraft={setDraft} />}
    </ConfigurationShell>
  );
}
