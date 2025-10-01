<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'location', 'start_time_utc', 'end_time_utc', 'max_capacity'
    ];

    protected $casts = [
        'start_time_utc' => 'datetime',
        'end_time_utc' => 'datetime',
        'max_capacity' => 'integer',
    ];

    public function attendees(): HasMany
    {
        return $this->hasMany(Attendee::class);
    }

    public function hasCapacity(): bool
    {
        if (is_null($this->max_capacity)) {
            return true;
        }
        return $this->attendees()->count() < $this->max_capacity;
    }

    public function remainingCapacity(): ?int
    {
        if (is_null($this->max_capacity)) {
            return null;
        }
        return max($this->max_capacity - $this->attendees()->count(), 0);
    }
}
