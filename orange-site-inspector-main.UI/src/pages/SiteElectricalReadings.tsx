import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Save, Send, Clock, MapPin, User, Calendar } from "lucide-react";

const SiteElectricalReadings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auto-filled data (would come from user context and selected site)
  const autoFilledData = {
    siteName: "Cairo Tower Site A",
    siteCode: "CTS-001",
    dateOfVisit: new Date().toISOString().split('T')[0],
    engineerName: "Ahmed Hassan"
  };

  const [formData, setFormData] = useState({
    // Section 1: Site Info
    timeIn: "",
    timeOut: "",
    
    // Section 2: Power Supply & Measurements
    meterReadingKWH: "",
    meterReadingKVARH: "",
    earthConnectionCheck: "",
    voltagePhase1: "",
    voltagePhase2: "",
    voltagePhase3: "",
    currentPhase1: "",
    currentPhase2: "",
    currentPhase3: "",
    
    // Section 3: Rectifier & Power Cabinet
    rectifierType: "",
    alarmModule1: false,
    alarmModule2: false,
    alarmModule3: false,
    alarmModule4: false,
    balanceCheck: "",
    groundCheck: "",
    outputsCheck: "",
    
    // Section 4: Batteries
    batteryBrand: "",
    batteryCount: "",
    batteryVoltage: "",
    batteryAh: "",
    batteryStrings: "",
    batteryRacks: "",
    visualSafetyCheck: "",
    
    // Section 5: GEDP Panel
    cbType: "",
    wiringCheck: "",
    fuseCheck: "",
    labelsCheck: "",
    appearanceCheck: "",
    
    // Additional notes
    notes: ""
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast({
      title: "Form Saved",
      description: "Electrical readings have been saved as draft.",
    });
  };

  const handleSubmit = () => {
    // Validation logic would go here
    toast({
      title: "Form Submitted",
      description: "Electrical readings have been submitted successfully.",
    });
    navigate("/visits");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Site Electrical Readings</h1>
        <p className="text-gray-600 dark:text-gray-400">Complete electrical inspection form for site evaluation</p>
      </div>

      <Accordion type="multiple" defaultValue={["section1", "section2"]} className="space-y-4">
        {/* Section 1: Site Info */}
        <AccordionItem value="section1">
          <AccordionTrigger className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Section 1: Site Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Auto-filled read-only fields */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Site Name</Label>
                    <Input 
                      value={autoFilledData.siteName} 
                      readOnly 
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Site Code</Label>
                    <Input 
                      value={autoFilledData.siteCode} 
                      readOnly 
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date of Visit</Label>
                    <Input 
                      value={autoFilledData.dateOfVisit} 
                      readOnly 
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Engineer Name</Label>
                    <Input 
                      value={autoFilledData.engineerName} 
                      readOnly 
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  
                  {/* Manual inputs */}
                  <div className="space-y-2">
                    <Label htmlFor="timeIn" className="text-sm font-medium">Time In *</Label>
                    <Input
                      id="timeIn"
                      type="time"
                      value={formData.timeIn}
                      onChange={(e) => handleInputChange("timeIn", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeOut" className="text-sm font-medium">Time Out</Label>
                    <Input
                      id="timeOut"
                      type="time"
                      value={formData.timeOut}
                      onChange={(e) => handleInputChange("timeOut", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Power Supply & Measurements */}
        <AccordionItem value="section2">
          <AccordionTrigger className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            Section 2: Power Supply & Measurements
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Meter Readings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meterKWH" className="text-sm font-medium">Meter Reading KWH</Label>
                    <Input
                      id="meterKWH"
                      type="number"
                      placeholder="Enter KWH reading"
                      value={formData.meterReadingKWH}
                      onChange={(e) => handleInputChange("meterReadingKWH", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meterKVARH" className="text-sm font-medium">Meter Reading KVARH</Label>
                    <Input
                      id="meterKVARH"
                      type="number"
                      placeholder="Enter KVARH reading"
                      value={formData.meterReadingKVARH}
                      onChange={(e) => handleInputChange("meterReadingKVARH", e.target.value)}
                    />
                  </div>
                </div>

                {/* Earth & Connection Check */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Earth & Connection Checks</Label>
                  <RadioGroup 
                    value={formData.earthConnectionCheck} 
                    onValueChange={(value) => handleInputChange("earthConnectionCheck", value)}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="earth-ok" />
                        <Label htmlFor="earth-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="earth-nok" />
                        <Label htmlFor="earth-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="earth-na" />
                        <Label htmlFor="earth-na" className="text-gray-600">N/A</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Voltage Measurements */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Voltage Measurements (V)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="voltage1" className="text-xs text-gray-600">Phase 1</Label>
                      <Input
                        id="voltage1"
                        type="number"
                        placeholder="Phase 1 (V)"
                        value={formData.voltagePhase1}
                        onChange={(e) => handleInputChange("voltagePhase1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voltage2" className="text-xs text-gray-600">Phase 2</Label>
                      <Input
                        id="voltage2"
                        type="number"
                        placeholder="Phase 2 (V)"
                        value={formData.voltagePhase2}
                        onChange={(e) => handleInputChange("voltagePhase2", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voltage3" className="text-xs text-gray-600">Phase 3</Label>
                      <Input
                        id="voltage3"
                        type="number"
                        placeholder="Phase 3 (V)"
                        value={formData.voltagePhase3}
                        onChange={(e) => handleInputChange("voltagePhase3", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Current Measurements */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Current Measurements (A)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current1" className="text-xs text-gray-600">Phase 1</Label>
                      <Input
                        id="current1"
                        type="number"
                        placeholder="Phase 1 (A)"
                        value={formData.currentPhase1}
                        onChange={(e) => handleInputChange("currentPhase1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current2" className="text-xs text-gray-600">Phase 2</Label>
                      <Input
                        id="current2"
                        type="number"
                        placeholder="Phase 2 (A)"
                        value={formData.currentPhase2}
                        onChange={(e) => handleInputChange("currentPhase2", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current3" className="text-xs text-gray-600">Phase 3</Label>
                      <Input
                        id="current3"
                        type="number"
                        placeholder="Phase 3 (A)"
                        value={formData.currentPhase3}
                        onChange={(e) => handleInputChange("currentPhase3", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Rectifier & Power Cabinet */}
        <AccordionItem value="section3">
          <AccordionTrigger className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            Section 3: Rectifier & Power Cabinet
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="rectifierType" className="text-sm font-medium">Rectifier Type</Label>
                  <Select value={formData.rectifierType} onValueChange={(value) => handleInputChange("rectifierType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rectifier type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="type-a">Type A - Standard</SelectItem>
                      <SelectItem value="type-b">Type B - High Capacity</SelectItem>
                      <SelectItem value="type-c">Type C - Backup</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Alarm Checks per Module</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alarm1"
                        checked={formData.alarmModule1}
                        onCheckedChange={(checked) => handleInputChange("alarmModule1", checked === true)}
                      />
                      <Label htmlFor="alarm1">Module 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alarm2"
                        checked={formData.alarmModule2}
                        onCheckedChange={(checked) => handleInputChange("alarmModule2", checked === true)}
                      />
                      <Label htmlFor="alarm2">Module 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alarm3"
                        checked={formData.alarmModule3}
                        onCheckedChange={(checked) => handleInputChange("alarmModule3", checked === true)}
                      />
                      <Label htmlFor="alarm3">Module 3</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alarm4"
                        checked={formData.alarmModule4}
                        onCheckedChange={(checked) => handleInputChange("alarmModule4", checked === true)}
                      />
                      <Label htmlFor="alarm4">Module 4</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Balance Check</Label>
                    <RadioGroup 
                      value={formData.balanceCheck} 
                      onValueChange={(value) => handleInputChange("balanceCheck", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="balance-ok" />
                        <Label htmlFor="balance-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="balance-nok" />
                        <Label htmlFor="balance-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="balance-na" />
                        <Label htmlFor="balance-na" className="text-gray-600">N/A</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Ground Check</Label>
                    <RadioGroup 
                      value={formData.groundCheck} 
                      onValueChange={(value) => handleInputChange("groundCheck", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="ground-ok" />
                        <Label htmlFor="ground-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="ground-nok" />
                        <Label htmlFor="ground-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="ground-na" />
                        <Label htmlFor="ground-na" className="text-gray-600">N/A</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Outputs Check</Label>
                    <RadioGroup 
                      value={formData.outputsCheck} 
                      onValueChange={(value) => handleInputChange("outputsCheck", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="outputs-ok" />
                        <Label htmlFor="outputs-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="outputs-nok" />
                        <Label htmlFor="outputs-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="outputs-na" />
                        <Label htmlFor="outputs-na" className="text-gray-600">N/A</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Batteries */}
        <AccordionItem value="section4">
          <AccordionTrigger className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            Section 4: Batteries
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batteryBrand" className="text-sm font-medium">Brand</Label>
                    <Input
                      id="batteryBrand"
                      placeholder="Battery brand"
                      value={formData.batteryBrand}
                      onChange={(e) => handleInputChange("batteryBrand", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batteryCount" className="text-sm font-medium">Count</Label>
                    <Input
                      id="batteryCount"
                      type="number"
                      placeholder="Number of batteries"
                      value={formData.batteryCount}
                      onChange={(e) => handleInputChange("batteryCount", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batteryVoltage" className="text-sm font-medium">Voltage (V)</Label>
                    <Input
                      id="batteryVoltage"
                      type="number"
                      placeholder="Voltage"
                      value={formData.batteryVoltage}
                      onChange={(e) => handleInputChange("batteryVoltage", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batteryAh" className="text-sm font-medium">Ah (Ampere-hours)</Label>
                    <Input
                      id="batteryAh"
                      type="number"
                      placeholder="Ah capacity"
                      value={formData.batteryAh}
                      onChange={(e) => handleInputChange("batteryAh", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batteryStrings" className="text-sm font-medium">Strings</Label>
                    <Input
                      id="batteryStrings"
                      type="number"
                      placeholder="Number of strings"
                      value={formData.batteryStrings}
                      onChange={(e) => handleInputChange("batteryStrings", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batteryRacks" className="text-sm font-medium">Racks</Label>
                    <Input
                      id="batteryRacks"
                      type="number"
                      placeholder="Number of racks"
                      value={formData.batteryRacks}
                      onChange={(e) => handleInputChange("batteryRacks", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Visual & Safety Checks</Label>
                  <RadioGroup 
                    value={formData.visualSafetyCheck} 
                    onValueChange={(value) => handleInputChange("visualSafetyCheck", value)}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="visual-ok" />
                        <Label htmlFor="visual-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="visual-nok" />
                        <Label htmlFor="visual-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="visual-na" />
                        <Label htmlFor="visual-na" className="text-gray-600">N/A</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Section 5: GEDP Panel */}
        <AccordionItem value="section5">
          <AccordionTrigger className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            Section 5: GEDP Panel
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cbType" className="text-sm font-medium">CB Type</Label>
                  <Select value={formData.cbType} onValueChange={(value) => handleInputChange("cbType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CB type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcb">MCB</SelectItem>
                      <SelectItem value="mccb">MCCB</SelectItem>
                      <SelectItem value="rcd">RCD</SelectItem>
                      <SelectItem value="rcbo">RCBO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Wiring Check</Label>
                    <RadioGroup 
                      value={formData.wiringCheck} 
                      onValueChange={(value) => handleInputChange("wiringCheck", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="wiring-ok" />
                        <Label htmlFor="wiring-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="wiring-nok" />
                        <Label htmlFor="wiring-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="wiring-na" />
                        <Label htmlFor="wiring-na" className="text-gray-600">N/A</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Fuse Check</Label>
                    <RadioGroup 
                      value={formData.fuseCheck} 
                      onValueChange={(value) => handleInputChange("fuseCheck", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="fuse-ok" />
                        <Label htmlFor="fuse-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="fuse-nok" />
                        <Label htmlFor="fuse-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="fuse-na" />
                        <Label htmlFor="fuse-na" className="text-gray-600">N/A</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Labels Check</Label>
                    <RadioGroup 
                      value={formData.labelsCheck} 
                      onValueChange={(value) => handleInputChange("labelsCheck", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="labels-ok" />
                        <Label htmlFor="labels-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="labels-nok" />
                        <Label htmlFor="labels-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="labels-na" />
                        <Label htmlFor="labels-na" className="text-gray-600">N/A</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Appearance Check</Label>
                    <RadioGroup 
                      value={formData.appearanceCheck} 
                      onValueChange={(value) => handleInputChange("appearanceCheck", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id="appearance-ok" />
                        <Label htmlFor="appearance-ok" className="text-green-600">OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NOK" id="appearance-nok" />
                        <Label htmlFor="appearance-nok" className="text-red-600">NOK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="appearance-na" />
                        <Label htmlFor="appearance-na" className="text-gray-600">N/A</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Additional Notes */}
        <AccordionItem value="notes">
          <AccordionTrigger className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            Additional Notes & Comments
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional observations or comments..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button 
          onClick={handleSave}
          variant="outline"
          className="flex-1 h-12 text-lg border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Draft
        </Button>
        
        <Button 
          onClick={handleSubmit}
          className="flex-1 h-12 text-lg btn-orange"
        >
          <Send className="h-5 w-5 mr-2" />
          Submit Form
        </Button>
      </div>
    </div>
  );
};

export default SiteElectricalReadings;
