import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  BarChart3,
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Calendar,
  FolderTree,
  UsersRound
} from "lucide-react";

import { EtudiantsManager } from "./EtudiantsManager";
import { FormateursManager } from "./FormateursManager";
import { CoursManager } from "./CoursManager";
import { InscriptionsManager } from "./InscriptionsManager";
import { NotesManager } from "./NotesManager";
import { SessionsManager } from "./SessionsManager";
import { SpecialitesManager } from "./SpecialitesManager";
import { GroupesManager } from "./GroupesManager";

export function AdminTabs() {

  const [activeTab, setActiveTab] = useState("etudiants");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

      {/* BARRE DE NAVIGATION */}
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2">

        <TabsTrigger value="overview" className="text-xs sm:text-sm">
          <BarChart3 className="w-4 h-4 mr-1" />
          Vue d'ensemble
        </TabsTrigger>

        <TabsTrigger value="etudiants" className="text-xs sm:text-sm">
          <GraduationCap className="w-4 h-4 mr-1" />
          Étudiants
        </TabsTrigger>

        <TabsTrigger value="formateurs" className="text-xs sm:text-sm">
          <Users className="w-4 h-4 mr-1" />
          Formateurs
        </TabsTrigger>

        <TabsTrigger value="cours" className="text-xs sm:text-sm">
          <BookOpen className="w-4 h-4 mr-1" />
          Cours
        </TabsTrigger>

        <TabsTrigger value="inscriptions" className="text-xs sm:text-sm">
          <Award className="w-4 h-4 mr-1" />
          Inscriptions
        </TabsTrigger>

        <TabsTrigger value="notes" className="text-xs sm:text-sm">
          <BarChart3 className="w-4 h-4 mr-1" />
          Notes
        </TabsTrigger>

        <TabsTrigger value="sessions" className="text-xs sm:text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          Sessions
        </TabsTrigger>

        <TabsTrigger value="specialites" className="text-xs sm:text-sm">
          <FolderTree className="w-4 h-4 mr-1" />
          Spécialités
        </TabsTrigger>

        <TabsTrigger value="groupes" className="text-xs sm:text-sm">
          <UsersRound className="w-4 h-4 mr-1" />
          Groupes
        </TabsTrigger>

      </TabsList>

      {/* CONTENU */}
      <TabsContent value="etudiants">
        <EtudiantsManager />
      </TabsContent>

      <TabsContent value="formateurs">
        <FormateursManager />
      </TabsContent>

      <TabsContent value="cours">
        <CoursManager />
      </TabsContent>

      <TabsContent value="inscriptions">
        <InscriptionsManager />
      </TabsContent>

      <TabsContent value="notes">
        <NotesManager />
      </TabsContent>

      <TabsContent value="sessions">
        <SessionsManager />
      </TabsContent>

      <TabsContent value="specialites">
        <SpecialitesManager />
      </TabsContent>

      <TabsContent value="groupes">
        <GroupesManager />
      </TabsContent>

    </Tabs>
  );
}
