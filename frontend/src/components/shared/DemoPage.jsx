import { useState } from 'react';
import { Button, Card, Badge, Modal, LoadingSpinner, Input, Select, TextArea, EmptyState } from './index';
import { BookOpen } from 'lucide-react';

export default function DemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Componentes Shared</h1>

      <Card>
        <h2 className="text-xl font-bold mb-4">Botones</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge type="success">Success</Badge>
          <Badge type="warning">Warning</Badge>
          <Badge type="error">Error</Badge>
          <Badge type="info">Info</Badge>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Demo Modal">
          <p>Contenido del modal</p>
          <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
        </Modal>
      </Card>

      <Card>
        <LoadingSpinner message="Cargando datos..." />
      </Card>
    </div>
  );
}
